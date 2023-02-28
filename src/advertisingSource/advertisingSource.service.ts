import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  AdvertisingSource,
  AdvertisingSourceDocument,
} from '../common/schemas';
import {
  AdvertisingSourceDto,
  AdvertisingSourceWithIdDto,
  GetAdvertisingSourceDto,
  GetPatientsDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
} from '../common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';

@Injectable()
export class AdvertisingSourceService {
  constructor(
    @InjectModel(AdvertisingSource.name)
    private advertisingSourceModel: Model<AdvertisingSourceDocument>,
  ) {}
  async get(dto: GetAdvertisingSourceDto): Promise<any> {
    const findCond = {
      $and: [
        {
          $or: [{ name: { $regex: `${dto.filter}`, $options: 'i' } }],
        },
        dto.isActive !== undefined
          ? {
              isActive: dto.isActive,
            }
          : {},
      ],
    };
    const query = this.advertisingSourceModel.find(findCond);
    const count = await this.advertisingSourceModel
      .find(findCond)
      .count()
      .exec();
    console.log(count);
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select('name isActive _id');
    const data = await query.exec();
    return { data, count };
  }

  // async getById(dto: GetPatientsByIdDto): Promise<any> {
  //   //TODO проверка на принадлежность пациента
  //   if (!mongoose.Types.ObjectId.isValid(dto.id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.patientModel
  //     .findById(dto.id)
  //     .select(
  //       'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
  //     )
  //     .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');

  //   return candidate;
  // }

  async add(
    dto: AdvertisingSourceDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const count = await this.advertisingSourceModel
      .findOne({ name: dto.name })
      .exec();
    console.log(count);
    if (count) throw new BadRequestException('name: must be unique');
    //console.log(dto);
    //TODO: Сделать проверку представителей
    const user = await this.advertisingSourceModel.create({
      ...dto,
    });
    const newPatient = new this.advertisingSourceModel(user);
    newPatient.save();
    return;
  }

  async update(
    dto: AdvertisingSourceWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.advertisingSourceModel
      .findById(dto._id)
      .exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    const count = await this.advertisingSourceModel
      .findOne({ name: dto.name })
      .exec();
    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');
    // delete dto._id;
    // console.log(dto);
    // console.log(
    //   await this.advertisingSourceModel.findByIdAndUpdate(dto._id, dto).exec(),
    // );
    this.advertisingSourceModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  // async changeStatus(
  //   dto: PatientChangeStatusDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (!mongoose.Types.ObjectId.isValid(dto._id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.patientModel.findById(dto._id).exec();
  //   // .select(
  //   //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
  //   // )
  //   // .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   this.patientModel.findByIdAndUpdate(dto._id, dto).exec();
  //   return;
  // }
}
