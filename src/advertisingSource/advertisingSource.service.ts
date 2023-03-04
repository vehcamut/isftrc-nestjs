import { BadRequestException } from '@nestjs/common/exceptions';
import {
  AdvertisingSource,
  AdvertisingSourceDocument,
} from '../common/schemas';
import {
  AdvertisingSourceDto,
  AdvertisingSourceWithIdDto,
  GetAdvertisingSourceDto,
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

  async add(
    dto: AdvertisingSourceDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const count = await this.advertisingSourceModel
      .findOne({ name: dto.name })
      .exec();

    if (count) throw new BadRequestException('Название должно быть уникальным');
    const newAdvSource = new this.advertisingSourceModel({
      ...dto,
    });
    newAdvSource.save();
    return;
  }

  async update(
    dto: AdvertisingSourceWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('Некорректный id источника рекламы');
    const candidate = await this.advertisingSourceModel
      .findById(dto._id)
      .exec();
    if (!candidate) throw new BadRequestException('Источник рекламы не найден');
    const count = await this.advertisingSourceModel
      .findOne({ name: dto.name })
      .exec();
    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');
    this.advertisingSourceModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }
}
