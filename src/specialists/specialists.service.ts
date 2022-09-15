import { SpecialistTypes, SpecialistTypesDocument } from './shcemas';
import { SpecialistTypesDto, SpecialistTypesQueryDto } from './dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectModel(SpecialistTypes.name)
    private SpecialistTypesModel: Model<SpecialistTypesDocument>,
  ) {}
  async getSpecialistTypes(
    dto: SpecialistTypesQueryDto,
  ): Promise<SpecialistTypesDto[]> {
    const query = this.SpecialistTypesModel.find({
      name: { $regex: `${dto.filter}`, $options: 'i' },
    });
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query.skip((dto.page - 1) * dto.limit).select('name _id');
    return query.exec() as Promise<SpecialistTypesDto[]>;
  }
}
