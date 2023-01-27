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
  SpecialistType,
  SpecialistTypeDocument,
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
  ServiceTypeWithIdDto,
  ServiceGroupWithTypesDto,
  ServiceGroupDto,
  ServiceTypeDto,
  ServiceGroupWithIdDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceGroup.name)
    private serviceGroupModel: Model<ServiceGroupDocument>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceTypeDocument>,
    @InjectModel(SpecialistType.name)
    private specialistTypeModel: Model<SpecialistTypeDocument>,
  ) {}
  async get(dto: GetServiceDto): Promise<any> {
    const findCond = {
      $and: [
        {
          $or: [{ name: { $regex: `${dto.filter}`, $options: 'i' } }],
        },
      ],
    };

    const groups = await this.serviceGroupModel
      .find()
      .select('name isActive _id')
      .exec();

    const types = await this.serviceTypeModel
      .find(findCond)
      .select('name isActive group time price _id defaultAmountPatient')
      .populate(
        'specialistTypes',
        'isActive name _id',
        this.specialistTypeModel,
        {
          isActive: true,
        },
      )
      .exec();
    const groupsWithType: ServiceGroupWithTypesDto[] = [];
    groups.forEach((group) => {
      groupsWithType.push({
        _id: group._id.toString(),
        isActive: group.isActive,
        name: group.name,
        types: [],
      });
    });
    types.forEach(async (type) => {
      const gr = await groupsWithType.find((el) => {
        return el._id === type.group.toString();
      });
      gr.types.push({
        _id: type._id,
        name: type.name,
        isActive: type.isActive,
        group: type.group.toString(),
        specialistTypes: type.specialistTypes,
        price: type.price,
        time: type.time,
        defaultAmountPatient: type.defaultAmountPatient,
      });
    });
    console.log(groupsWithType);
    return groupsWithType;
  }

  async getGroups(dto: GetServiceDto): Promise<any> {
    const groups = this.serviceGroupModel
      .find()
      .select('name isActive _id')
      .exec();

    return groups;
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
    if (cand) throw new BadRequestException('Название должно быть уникальным');
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
    if (cand) throw new BadRequestException('Название должно быть уникальным');

    if (!mongoose.Types.ObjectId.isValid(dto.group))
      throw new BadRequestException('id группы услуг не найден');

    const candidate = await this.serviceGroupModel.findById(dto.group).exec();
    if (!candidate) throw new BadRequestException('id группы услуг не найден');

    const specialistTypes: Types.ObjectId[] = [];

    for (let i = 0; i < dto.specialistTypes.length; i++) {
      try {
        specialistTypes.push(new Types.ObjectId(dto.specialistTypes[i]));
        //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
      } catch (e) {
        console.log(e);
        throw new BadRequestException(
          `Неизвестная специальность: ${dto.specialistTypes[i]}`,
        );
      }

      const candidate = await this.specialistTypeModel.findById(
        specialistTypes[i],
      );
      if (!candidate)
        throw new BadRequestException(
          `Неизвестная специальность: ${dto.specialistTypes[i]}`,
        );
    }

    const type = await this.serviceTypeModel.create({
      ...dto,
      specialistTypes,
    });
    const newType = new this.serviceTypeModel(type);
    newType.save();
    return;
  }

  async updateGroup(
    dto: ServiceGroupWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.serviceGroupModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    const count = await this.serviceGroupModel
      .findOne({ name: dto.name })
      .exec();
    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');
    this.serviceGroupModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async updateType(
    dto: ServiceTypeWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('id услуги не найден');
    const candidate = await this.serviceTypeModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('id услуги не найден');
    const count = await this.serviceTypeModel
      .findOne({ name: dto.name })
      .exec();
    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');

    if (!mongoose.Types.ObjectId.isValid(dto.group))
      throw new BadRequestException('id группы услуг не найден');

    const groupCand = await this.serviceGroupModel.findById(dto.group).exec();
    if (!groupCand) throw new BadRequestException('id группы услуг не найден');

    const specialistTypes: Types.ObjectId[] = [];

    for (let i = 0; i < dto.specialistTypes.length; i++) {
      try {
        specialistTypes.push(new Types.ObjectId(dto.specialistTypes[i]));
        //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
      } catch (e) {
        console.log(e);
        throw new BadRequestException(
          `Неизвестная специальность: ${dto.specialistTypes[i]}`,
        );
      }

      const candidate = await this.specialistTypeModel.findById(
        specialistTypes[i],
      );
      if (!candidate)
        throw new BadRequestException(
          `Неизвестная специальность: ${dto.specialistTypes[i]}`,
        );
    }

    this.serviceTypeModel
      .findByIdAndUpdate(dto._id, { ...dto, specialistTypes })
      .exec();
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
