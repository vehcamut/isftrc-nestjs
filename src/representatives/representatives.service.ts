import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  User,
  Patient,
  PatientDocument,
  UserDocument,
  AdvertisingSource,
  AdvertisingSourceDocument,
} from 'src/common/schemas';
import * as bcrypt from 'bcrypt';
import {
  AddBaseUserDto,
  AddRepresentativeDto,
  GetPatientsDto,
  GetRepresentativesByIdDto,
  GetRepresentativesDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  RepresentativeWithIdDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { hashDataSHA512 } from 'src/common/common';

@Injectable()
export class RepresentativesService {
  constructor(
    @InjectModel(User.name)
    private representativesModel: Model<UserDocument>,
    @InjectModel(AdvertisingSource.name)
    private advertisingSourceModel: Model<AdvertisingSourceDocument>,
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
  ) {}
  async get(dto: GetRepresentativesDto): Promise<any> {
    const findCond = {
      $and: [
        {
          $or: [
            { name: { $regex: `${dto.filter}`, $options: 'i' } },
            { surname: { $regex: `${dto.filter}`, $options: 'i' } },
            { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
            { phoneNumbers: { $regex: `${dto.filter}`, $options: 'i' } },
            { emails: { $regex: `${dto.filter}`, $options: 'i' } },
            { address: { $regex: `${dto.filter}`, $options: 'i' } },
            { login: { $regex: `${dto.filter}`, $options: 'i' } },
          ],
        },
        { roles: { $in: ['representative'] } },
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
    const query = this.representativesModel.find(findCond);
    const count = await this.representativesModel.find(findCond).count().exec();
    console.log(count);
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'name surname patronymic dateOfBirth phoneNumbers emails gender address isActive advertisingSources _id login',
      );
    const data = await query.exec();
    return { data, count };
  }

  async getById(dto: GetRepresentativesByIdDto): Promise<any> {
    //TODO проверка на принадлежность пациента
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.representativesModel
      .findById(dto.id)
      .select(
        'name surname patronymic dateOfBirth gender address isActive phoneNumbers emails login _id advertisingSources',
      )
      .populate('advertisingSources', 'name _id', this.advertisingSourceModel, {
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
    dto: AddRepresentativeDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const count = await this.representativesModel
      .findOne({ login: dto.login })
      .exec();
    console.log(count);
    if (count) throw new BadRequestException('Логин должен быть уникальным');
    let hashedPassword: string;
    if (dto.hash) hashedPassword = hashDataSHA512(dto.hash);
    else hashedPassword = hashDataSHA512(dto.login);
    // const hashedPassword = await this.hashData(dto.login);
    const advertisingSources: Types.ObjectId[] = [];

    for (let i = 0; i < dto.advertisingSources.length; i++) {
      console.log(dto.advertisingSources[i]);
      try {
        advertisingSources.push(new Types.ObjectId(dto.advertisingSources[i]));
        //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
      } catch (e) {
        console.log(e);
        throw new BadRequestException(
          `types: include unknown type ${dto.advertisingSources[i]}`,
        );
      }

      const candidate = await this.advertisingSourceModel.findById(
        advertisingSources[i],
      );
      if (!candidate)
        throw new BadRequestException(
          `types: include unknown type ${dto.advertisingSources[i]}`,
        );
    }

    const user = await this.representativesModel.create({
      ...dto,
      hash: hashedPassword,
      advertisingSources,
    });
    const newRepresentative = new this.representativesModel(user);
    newRepresentative.save();
    return;
  }

  async update(
    dto: RepresentativeWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.representativesModel.findById(dto._id).exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    console.log(dto);
    if (dto.hash) dto.hash = hashDataSHA512(dto.hash);
    this.representativesModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async changeStatus(
    dto: PatientChangeStatusDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.representativesModel.findById(dto._id).exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    this.representativesModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async getPatientsById(dto: GetRepresentativesByIdDto): Promise<any> {
    //TODO проверка на принадлежность пациента
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.representativesModel
      .findById(dto.id)
      .select('-_id patients')
      .populate(
        'patients',
        'number name surname patronymic dateOfBirth gender address isActive note _id',
        this.patientModel,
        {
          isActive: true,
        },
      )
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

    return candidate?.patients;
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }
}
