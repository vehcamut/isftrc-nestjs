import { SpecialistType, SpecialistTypeDocument } from './shcemas';
import { SpecialistTypeDto, SpecialistTypesQueryDto } from './dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectModel(SpecialistType.name)
    private SpecialistTypeModel: Model<SpecialistTypeDocument>,
  ) {}
  async getSpecialistTypes(
    dto: SpecialistTypesQueryDto,
  ): Promise<SpecialistTypeDto[]> {
    const query = this.SpecialistTypeModel.find({
      $and: [
        { name: { $regex: `${dto.filter.name}`, $options: 'i' } },
        { note: { $regex: `${dto.filter.note}`, $options: 'i' } },
      ],
    });
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query.skip((dto.page - 1) * dto.limit).select('name note _id');
    return query.exec() as Promise<SpecialistTypeDto[]>;
  }
  async addSpecialistType(dto: SpecialistTypeDto): Promise<string> {
    const candidate = await this.SpecialistTypeModel.findOne(dto);
    if (candidate) throw new BadRequestException('name: must be unique');
    const query = this.SpecialistTypeModel.create(dto);
    return 'Success';

    // .find({
    //   name: { $regex: `${dto.filter}`, $options: 'i' },
    // });
    // if (dto.sort)
    //   query.sort({
    //     [dto.sort]: dto.order as SortOrder,
    //   });

    // query.skip((dto.page - 1) * dto.limit).select('name _id');
    // return query.exec() as Promise<SpecialistTypesDto[]>;
  }
}
