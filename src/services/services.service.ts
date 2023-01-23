import { ServiceGroupWithTypesDto } from './../common/dtos/servise.dto';
import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  AdvertisingSource,
  AdvertisingSourceDocument,
  Service,
  ServiceDocument,
  ServiceGroup,
  ServiceGroupDocument,
  ServiceType,
  ServiceTypeDocument,
} from 'src/common/schemas';
import {
  AdvertisingSourceDto,
  AdvertisingSourceWithIdDto,
  GetAdvertisingSourceDto,
  GetPatientsDto,
  GetRequestDto,
  GetServiceDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  ServiceGroupDto,
  ServiceTypeDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceGroup.name)
    private serviceGroupModel: Model<ServiceGroupDocument>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceTypeDocument>,
  ) {}
  async get(dto: GetServiceDto): Promise<any> {
    const findCond = {
      $and: [
        {
          $or: [{ name: { $regex: `${dto.filter}`, $options: 'i' } }],
        },
      ],
    };
    // const query = this.serviceTypeModel.aggregate([
    //   {
    //     // $match: findCond,
    //     $group: {
    //       _id: '$group',
    //     },
    //   },
    // ]);
    const groups = await this.serviceGroupModel
      .find()
      .select('name isActive _id')
      .exec();
    const types = await this.serviceTypeModel.find(findCond).exec();
    const groupsWithType: ServiceGroupWithTypesDto[] = [];
    groups.forEach((group) => {
      groupsWithType.push({
        _id: group._id.toString(),
        isActive: group.isActive,
        name: group.name,
        types: [],
      });
    });
    console.log(groupsWithType);
    types.forEach(async (type) => {
      const gr = await groupsWithType.find((el) => {
        console.log(el._id);
        return el._id === type.group.toString();
      });
      console.log(type.group.toString(), gr);
      gr.types.push({
        _id: type._id,
        name: type.name,
        isActive: type.isActive,
        group: type.group.toString(),
        specialistTypes: type.specialistTypes.map((st) => st.toString()),
      });
    });
    // .find(findCond);
    // const query = this.serviceModel.find(findCond);
    // const count = await this.serviceModel.find(findCond).count().exec();
    // console.log(count);
    // if (dto.sort)
    //   query.sort({
    //     [dto.sort]: dto.order as SortOrder,
    //   });

    // query
    //   .skip(dto.page * dto.limit)
    //   .limit(dto.limit)
    //   .select('name isActive _id');
    // const data = await query.exec();
    return groupsWithType;
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

  async addGroup(
    dto: ServiceGroupDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const cand = await this.serviceGroupModel
      .findOne({ name: dto.name })
      .exec();
    if (cand) throw new BadRequestException('name: must be unique');
    //console.log(dto);
    const group = await this.serviceGroupModel.create(dto);
    const newGroup = new this.serviceGroupModel(group);
    newGroup.save();
    return;
  }

  async addType(
    dto: ServiceTypeDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const cand = await this.serviceTypeModel.findOne({ name: dto.name }).exec();
    if (cand) throw new BadRequestException('name: must be unique');

    if (!mongoose.Types.ObjectId.isValid(dto.group))
      throw new BadRequestException('_id: not found');

    const candidate = await this.serviceGroupModel.findById(dto.group).exec();
    if (!candidate) throw new BadRequestException('_id: not found');

    const type = await this.serviceTypeModel.create(dto);
    const newType = new this.serviceTypeModel(type);
    newType.save();
    return;
  }

  // async update(
  //   dto: AdvertisingSourceWithIdDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (!mongoose.Types.ObjectId.isValid(dto._id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.advertisingSourceModel
  //     .findById(dto._id)
  //     .exec();
  //   // .select(
  //   //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
  //   // )
  //   // .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   const count = await this.advertisingSourceModel
  //     .findOne({ name: dto.name })
  //     .exec();
  //   if (count && count._id.toString() !== dto._id)
  //     throw new BadRequestException('Название должно быть уникальным');
  //   // delete dto._id;
  //   // console.log(dto);
  //   // console.log(
  //   //   await this.advertisingSourceModel.findByIdAndUpdate(dto._id, dto).exec(),
  //   // );
  //   this.advertisingSourceModel.findByIdAndUpdate(dto._id, dto).exec();
  //   return;
  // }

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
