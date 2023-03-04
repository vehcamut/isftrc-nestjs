import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  AdvertisingSource,
  AdvertisingSourceDocument,
  SpecialistType,
  SpecialistTypeDocument,
} from '../common/schemas';
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
} from '../common/dtos';
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

  async add(
    dto: SpecialistTypeDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const spec = await this.specialistTypeModel
      .findOne({ name: dto.name })
      .exec();
    if (spec)
      throw new BadRequestException(
        'Название типа услуг должно быть уникальным',
      );
    const newType = new this.specialistTypeModel({
      ...dto,
    });
    newType.save();
    return;
  }

  async update(
    dto: SpecialistTypeWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('Некорректный id типа услуг');
    const candidate = await this.specialistTypeModel.findById(dto._id).exec();

    if (!candidate) throw new BadRequestException('Тип услуг не найден');
    const count = await this.specialistTypeModel
      .findOne({ name: dto.name })
      .exec();

    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');

    this.specialistTypeModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }
}
