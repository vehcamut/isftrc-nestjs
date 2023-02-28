import {
  GetSpecialistsDto,
  GetSpecialistsByIdDto,
  AddSpecialistDto,
} from './../common/dtos/specialist.dto';
import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  User,
  Patient,
  PatientDocument,
  UserDocument,
  AdvertisingSource,
  AdvertisingSourceDocument,
  SpecialistTypeDocument,
  SpecialistType,
  ServiceType,
  ServiceTypeDocument,
} from '../common/schemas';
import * as bcrypt from 'bcrypt';
import {
  GetSpecificSpecialists,
  SpecialistToSelectDto,
  SpecialistWithIdDto,
  SpecialistChangeStatusDto,
} from '../common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { hashDataSHA512 } from '../common/common';
import { type } from 'os';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectModel(User.name)
    private specialistModel: Model<UserDocument>,
    @InjectModel(SpecialistType.name)
    private specialistTypeModel: Model<SpecialistTypeDocument>,
    @InjectModel(ServiceType.name)
    private sericeTypeModel: Model<ServiceTypeDocument>,
  ) {}
  async get(dto: GetSpecialistsDto): Promise<any> {
    const types = await this.specialistTypeModel
      .find({ name: { $regex: `${dto.filter}`, $options: 'i' } })
      .transform((d) => d.map((t) => t._id))
      .exec();
    console.log(types);
    // let patientId;
    // if (dto.patientId) {
    //   if (!mongoose.Types.ObjectId.isValid(dto.patientId))
    //     throw new BadRequestException('_id: not found');
    //   const candidate = await this.patientModel.findById(dto.patientId).exec();
    //   if (!candidate) throw new BadRequestException('_id: not found');
    //   patientId = dto.patientId;
    // }
    // console.log('PP', patientId);
    const findCond = {
      $and: [
        // patientId
        //   ? {
        //       patients: {
        //         $not: { $elemMatch: { $in: [patientId] } },
        //       },
        //     }
        //   : {},
        {
          $or: [
            { name: { $regex: `${dto.filter}`, $options: 'i' } },
            { surname: { $regex: `${dto.filter}`, $options: 'i' } },
            { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
            { phoneNumbers: { $regex: `${dto.filter}`, $options: 'i' } },
            { emails: { $regex: `${dto.filter}`, $options: 'i' } },
            { address: { $regex: `${dto.filter}`, $options: 'i' } },
            { login: { $regex: `${dto.filter}`, $options: 'i' } },
            { types: { $in: types } },
            // {
            //   types: {
            //     $elemMatch: {
            //       'types.name': { $regex: `${dto.filter}` },
            //     },
            //   },
            // },
          ],
        },
        { roles: { $in: ['specialist'] } },
        dto.gender
          ? {
              gender: dto.gender,
            }
          : {},
        dto.isActive !== undefined
          ? {
              isActive: dto.isActive,
            }
          : {},
      ],
    };
    const query = this.specialistModel.find(findCond);
    const count = await this.specialistModel.find(findCond).count().exec();
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'name surname patronymic dateOfBirth phoneNumbers emails gender address isActive types _id login',
      )
      .populate([
        {
          path: 'types',
          model: 'SpecialistType',
          select: 'name',
        },
      ]);
    const data = await query.exec();
    return { data, count };
  }

  async getSpecificSpecialists(
    dto: GetSpecificSpecialists,
  ): Promise<SpecialistToSelectDto[]> {
    if (!mongoose.Types.ObjectId.isValid(dto.type))
      throw new BadRequestException('тип услуги не найден');
    // console.log(dto.type);
    const type = await this.sericeTypeModel.findById(dto.type).exec();
    // console.log(type);
    if (!type) throw new BadRequestException('тип услуги не найден');
    console.log(type.specialistTypes);
    const findCond = {
      $and: [
        { types: { $elemMatch: { $in: type.specialistTypes } } },
        { roles: { $in: ['specialist'] } },
        {
          isActive: true,
        },
      ],
    };
    const query = this.specialistModel
      .find(findCond)
      .select('name surname patronymic _id');
    const data = await query.exec();
    return data.map((spec) => {
      return {
        _id: spec._id,
        name: `${spec.surname} ${spec.name[0]}.${spec.patronymic[0]}.`,
      };
    });
  }

  async getById(dto: GetSpecialistsByIdDto): Promise<any> {
    const candidate = await this.specialistModel
      .findById(dto.id)
      .select(
        'name surname patronymic dateOfBirth gender address isActive phoneNumbers emails login _id types',
      )
      .populate('types', 'name _id', this.specialistTypeModel, {
        isActive: true,
      })
      .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    console.log(candidate);
    // candidate.advertisingSources.forEach(async function (value, index) {
    //   const id = this[index];
    //   const cand = await this.advertisingSourceModel
    //     .findById(id)
    //     .select('name _id isActive')
    //     .exec();

    //   if (cand && cand.isActive) {
    //     this[index] = { _id: cand._id, name: cand.name };
    //   }
    // }, candidate.advertisingSources);

    return candidate;
  }

  async add(
    dto: AddSpecialistDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const count = await this.specialistModel
      .findOne({ login: dto.login })
      .exec();
    if (count) throw new BadRequestException('Логин должен быть уникальным');
    let hashedPassword: string;

    if (dto.hash) hashedPassword = hashDataSHA512(dto.hash);
    else hashedPassword = hashDataSHA512(dto.login);
    // const hashedPassword = await this.hashData(dto.login);
    const types: Types.ObjectId[] = [];

    for (let i = 0; i < dto.types.length; i++) {
      // console.log(dto.types[i]);
      try {
        types.push(new Types.ObjectId(dto.types[i]));
        //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
      } catch (e) {
        // console.log(e);
        throw new BadRequestException(
          `types: include unknown type ${dto.types[i]}`,
        );
      }

      const candidate = await this.specialistTypeModel.findById(types[i]);
      if (!candidate)
        throw new BadRequestException(
          `types: include unknown type ${dto.types[i]}`,
        );
    }

    // const user = await this.specialistModel.create({
    //   ...dto,
    //   hash: hashedPassword,
    //   types,
    //   roles: ['specialist'],
    // });
    // const newSpecialist = new this.specialistModel(user);
    // newSpecialist.save();
    const newSpecialist = new this.specialistModel({
      ...dto,
      hash: hashedPassword,
      types,
      roles: ['specialist'],
    });
    newSpecialist.save();
    return newSpecialist._id;
  }

  async update(
    dto: SpecialistWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isSpec = roles.find((r) => r === 'specialist');
    if (isSpec) {
      if (id !== dto._id) throw new BadRequestException('специалист не найден');
    }
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('некорректный id специалиста');
    const candidate = await this.specialistModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('специалист не найден');
    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');
    if (!candidate.isActive)
      throw new BadRequestException('специалист деактивирован');
    if (dto.hash) dto.hash = hashDataSHA512(dto.hash);
    this.specialistModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async changeStatus(
    dto: SpecialistChangeStatusDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.specialistModel.findById(dto._id).exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    this.specialistModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }
}
