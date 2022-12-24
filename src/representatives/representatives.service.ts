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
  GetRepresentativesDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';

@Injectable()
export class RepresentativesService {
  constructor(
    @InjectModel(User.name)
    private representativesModel: Model<UserDocument>,
    @InjectModel(AdvertisingSource.name)
    private advertisingSourceModel: Model<AdvertisingSourceDocument>,
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

  // async getById(dto: GetPatientsByIdDto): Promise<any> {
  //   //TODO проверка на принадлежность пациента
  //   if (!mongoose.Types.ObjectId.isValid(dto.id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.representativesModel
  //     .findById(dto.id)
  //     .select(
  //       'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
  //     )
  //     .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');

  //   return candidate;
  // }

  async add(
    dto: AddRepresentativeDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const count = await this.representativesModel
      .findOne({ login: dto.login })
      .exec();
    console.log(count);
    if (count) throw new BadRequestException('login: must be unique');
    const hashedPassword = await this.hashData(dto.login);
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
    dto: PatientWithIdDto,
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
    delete dto.number;
    console.log(dto);
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

  async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }
}
