import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  AdvertisingSource,
  AdvertisingSourceDocument,
  SpecialistType,
  SpecialistTypeDocument,
} from 'src/common/schemas';
import {
  AdvertisingSourceDto,
  AdvertisingSourceWithIdDto,
  GetAdvertisingSourceDto,
  GetPatientsDto,
  GetRequestDto,
  GetSpecialistTypeDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  SpecialistTypeDto,
  SpecialistTypeWithIdDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';

@Injectable()
export class SpecialistTypeService {
  constructor(
    @InjectModel(SpecialistType.name)
    private specialistTypeModel: Model<SpecialistTypeDocument>,
  ) {}
  async get(dto: GetSpecialistTypeDto): Promise<any> {
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
    const query = this.specialistTypeModel.find(findCond);
    const count = await this.specialistTypeModel.find(findCond).count().exec();
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
    dto: SpecialistTypeDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const count = await this.specialistTypeModel
      .findOne({ name: dto.name })
      .exec();
    if (count) throw new BadRequestException('name: must be unique');
    //TODO: Сделать проверку представителей
    const type = await this.specialistTypeModel.create({
      ...dto,
    });
    const newType = new this.specialistTypeModel(type);
    newType.save();
    return;
  }

  async update(
    dto: SpecialistTypeWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.specialistTypeModel.findById(dto._id).exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    const count = await this.specialistTypeModel
      .findOne({ name: dto.name })
      .exec();

    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');
    // delete dto._id;
    // console.log(dto);
    // console.log(
    //   await this.advertisingSourceModel.findByIdAndUpdate(dto._id, dto).exec(),
    // );
    this.specialistTypeModel.findByIdAndUpdate(dto._id, dto).exec();
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
