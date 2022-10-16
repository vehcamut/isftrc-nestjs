import { SpecialistTypeRemoveDto } from './dto/specialist-type.dto';
import { SpecialistType, SpecialistTypeDocument } from './schemas';
import { SpecialistTypeDto, SpecialistTypesQueryDto } from './dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ISpecialistTypesRes } from './interfaces';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectModel(SpecialistType.name)
    private SpecialistTypeModel: Model<SpecialistTypeDocument>,
  ) {}
  async getSpecialistTypes(
    dto: SpecialistTypesQueryDto,
  ): Promise<ISpecialistTypesRes> {
    const query = this.SpecialistTypeModel.find({
      $or: [
        { name: { $regex: `${dto.name}`, $options: 'i' } },
        { note: { $regex: `${dto.note}`, $options: 'i' } },
      ],
    });
    const count = await this.SpecialistTypeModel.find({
      $or: [
        { name: { $regex: `${dto.name}`, $options: 'i' } },
        { note: { $regex: `${dto.note}`, $options: 'i' } },
      ],
    })
      .count()
      .exec();
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select('name note _id');
    const data = await query.exec();
    return { data, count };
  }
  async addSpecialistType(dto: SpecialistTypeDto): Promise<object> {
    const candidate = await this.SpecialistTypeModel.findOne({
      name: dto.name,
    });
    if (candidate) throw new BadRequestException('name: must be unique');
    const query = this.SpecialistTypeModel.create(dto);
    return { message: 'success' };

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
  async editSpecialistType(dto: SpecialistTypeDto): Promise<object> {
    let candidate = await this.SpecialistTypeModel.findById(dto._id).exec();
    //  One({
    //   _id: dto._id,
    // });
    console.log(dto.name, dto.note, dto._id);
    if (!candidate) throw new BadRequestException('_id: not found');
    candidate = await this.SpecialistTypeModel.findOne({
      name: dto.name,
    });
    if (candidate && candidate._id != dto._id)
      throw new BadRequestException('name: must be unique');
    this.SpecialistTypeModel.findByIdAndUpdate(dto._id, {
      name: dto.name,
      note: dto.note,
    }).exec();
    return { message: 'success' };

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
  async removeSpecialistType(dto: SpecialistTypeRemoveDto): Promise<string> {
    const candidate = await this.SpecialistTypeModel.findById(dto._id).exec();
    //  One({
    //   _id: dto._id,
    // });
    //console.log(dto.name, dto.note);
    if (!candidate) throw new BadRequestException('_id: not found');
    this.SpecialistTypeModel.findByIdAndDelete(dto._id).exec();
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
