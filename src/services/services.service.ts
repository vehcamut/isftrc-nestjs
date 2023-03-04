import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Service,
  ServiceDocument,
  ServiceGroup,
  ServiceGroupDocument,
  ServiceType,
  ServiceTypeDocument,
  SpecialistType,
  SpecialistTypeDocument,
  Appointment,
  Course,
  AppointmentDocument,
  User,
  UserDocument,
} from '../common/schemas';
import {
  GetServiceDto,
  ServiceTypeWithIdDto,
  ServiceGroupWithTypesDto,
  ServiceGroupDto,
  ServiceTypeDto,
  ServiceGroupWithIdDto,
  GetServiseByIdDto,
  AddAppointmentToServiceDto,
  GetTypesDto,
  CloseServiceDto,
  OpenServiceDto,
  ChangeNoteDto,
} from '../common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(ServiceGroup.name)
    private serviceGroupModel: Model<ServiceGroupDocument>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceTypeDocument>,
    @InjectModel(SpecialistType.name)
    private specialistTypeModel: Model<SpecialistTypeDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(User.name)
    private representativeModel: Model<UserDocument>,
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
    return groupsWithType;
  }

  async getGroups(dto: GetServiceDto): Promise<any> {
    const groups = this.serviceGroupModel
      .find({
        isActive: true,
      })
      .select('name _id')
      .exec();

    return groups;
  }

  async getTypes(dto: GetTypesDto): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(dto.group))
      throw new BadRequestException('Некорретный id группы услуг');
    const group = await this.serviceGroupModel.findById(dto.group).exec();
    if (!group) throw new BadRequestException('Группа услуг не найдена');

    const types = this.serviceTypeModel
      .find({
        group: group._id,
        isActive: true,
      })
      .select('name _id')
      .exec();

    return types;
  }

  async getAllInfoService(
    dto: GetServiseByIdDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const isRepresentative = roles.find((r) => r === 'representative');

    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некоррентный id услуги');

    const service: any = await this.serviceModel
      .findOne({ _id: dto.id })
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
        },
        {
          path: 'course',
          model: 'Course',
        },
        {
          path: 'patient',
          model: 'Patient',
        },
        {
          path: 'appointment',
          model: 'Appointment',
          populate: {
            path: 'specialist',
            model: 'User',
            select: {
              name: 1,
              surname: 1,
              patronymic: 1,
              isActive: 1,
            },
          },
        },
      ]);
    if (!service) throw new BadRequestException('Услуга не найдена');
    if (isRepresentative) {
      const representative = await this.representativeModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('Представитель не найден');
      if (
        !representative.patients.find(
          (p) => p._id.toString() === service.patient._id.toString(),
        )
      )
        throw new BadRequestException('Пациент не найден');
    }

    const canBeRemoved = service.appointment
      ? service.course.status
      : undefined;

    const serv = JSON.parse(JSON.stringify(service));

    if (isRepresentative) {
      delete serv.note;
    }

    return {
      ...serv,
      canBeRemoved,
    };
  }

  async addGroup(
    dto: ServiceGroupDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const cand = await this.serviceGroupModel
      .findOne({ name: dto.name })
      .exec();
    if (cand) throw new BadRequestException('Название должно быть уникальным');
    const newGroup = new this.serviceGroupModel(dto);
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
      throw new BadRequestException('Некорректный id группы услуг');

    const candidate = await this.serviceGroupModel.findById(dto.group).exec();
    if (!candidate) throw new BadRequestException('Группа услуг не найдена');

    const specialistTypes: Types.ObjectId[] = [];

    for (let i = 0; i < dto.specialistTypes.length; i++) {
      try {
        specialistTypes.push(new Types.ObjectId(dto.specialistTypes[i]));
      } catch (e) {
        throw new BadRequestException(
          `Некорректный id специальности: ${dto.specialistTypes[i]}`,
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

    const newType = new this.serviceTypeModel({
      ...dto,
      specialistTypes,
    });
    newType.save();
    return;
  }

  async updateGroup(
    dto: ServiceGroupWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('Некорректный id группы услуг');
    const candidate = await this.serviceGroupModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('Группа услуг не найдена');
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
      throw new BadRequestException('Некорректный id типа услуг');
    const candidate = await this.serviceTypeModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('Тип услуги не найден');
    const count = await this.serviceTypeModel
      .findOne({ name: dto.name })
      .exec();
    if (count && count._id.toString() !== dto._id)
      throw new BadRequestException('Название должно быть уникальным');

    if (!mongoose.Types.ObjectId.isValid(dto.group))
      throw new BadRequestException('Некорректный id группы услуг');

    const groupCand = await this.serviceGroupModel.findById(dto.group).exec();
    if (!groupCand) throw new BadRequestException('Группа услуг не найдена');

    const specialistTypes: Types.ObjectId[] = [];

    for (let i = 0; i < dto.specialistTypes.length; i++) {
      try {
        specialistTypes.push(new Types.ObjectId(dto.specialistTypes[i]));
      } catch (e) {
        throw new BadRequestException(
          `Некорректный id специальности: ${dto.specialistTypes[i]}`,
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

  async setAppointment(
    dto: AddAppointmentToServiceDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isRepresentative = roles.find((r) => r === 'representative');
    if (!mongoose.Types.ObjectId.isValid(dto.serviceId))
      throw new BadRequestException('Некоррентный id услуги');
    const service: any = await this.serviceModel
      .findById(dto.serviceId)
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
        },
        {
          path: 'appointment',
          model: 'Appointment',
        },
      ])
      .exec();

    if (!service) throw new BadRequestException('Услуга не найдена');
    if (isRepresentative) {
      const representative = await this.representativeModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('Представитель не найден');
      if (
        !representative.patients.find(
          (p) => p._id.toString() === service.patient._id.toString(),
        )
      )
        throw new BadRequestException('Пациент не найден');
      if (service.appointment) {
        const now = new Date();
        const nowDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
        ).valueOf();
        const appDate = new Date(service.appointment.begDate)
          .setHours(0, 0, 0, 0)
          .valueOf();
        if (appDate <= nowDate)
          throw new BadRequestException('Запись уже нельзя изменить');
      }
    }
    if (service.appointment) {
      const currentAppointment = await this.appointmentModel
        .findById(service.appointment)
        .exec();
      this.appointmentModel
        .findByIdAndUpdate(currentAppointment._id, {
          service: null,
        })
        .exec();
    }

    if (dto.appointmentId) {
      // проверка id записи
      if (!mongoose.Types.ObjectId.isValid(dto.appointmentId))
        throw new BadRequestException('Запись не найдена');
      const appointment = await this.appointmentModel
        .findById(dto.appointmentId)
        .populate<{ specialist: User }>([
          {
            path: 'specialist',
            model: 'User',
          },
        ])
        .exec();
      if (!appointment) throw new BadRequestException('Запись не найдена');
      if (!appointment.specialist.isActive)
        throw new BadRequestException('Специалист деактивирован');
      if (appointment.service)
        throw new BadRequestException('Данное время уже занято');
      const time =
        (service.type.time.getHours() * 60 + service.type.time.getMinutes()) *
        60 *
        1000;
      const duration =
        appointment.endDate.getTime() - appointment.begDate.getTime();
      if (duration == time) {
        this.serviceModel
          .findByIdAndUpdate(service._id, {
            appointment: new Types.ObjectId(appointment._id),
          })
          .exec();
        this.appointmentModel
          .findByIdAndUpdate(appointment._id, {
            service: new Types.ObjectId(service._id),
          })
          .exec();
        return appointment._id;
      } else
        throw new BadRequestException(
          'Данное время не подходит по длительности',
        );
    } else {
      this.serviceModel
        .findByIdAndUpdate(service._id, {
          appointment: null,
        })
        .exec();
    }
    return undefined;
  }

  async closeService(
    dto: CloseServiceDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isSpecialist = roles.find((r) => r === 'specialist');
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некорректный id услуги');
    const service = await this.serviceModel
      .findById(dto.id)
      .populate<{ appointment: Appointment; course: Course }>([
        {
          path: 'appointment',
          model: 'Appointment',
        },
        {
          path: 'course',
          model: 'Course',
        },
      ])
      .exec();

    if (!service) throw new BadRequestException('Услуга не найдена');

    if (!service.appointment)
      throw new BadRequestException(
        'Невозможно закрыть услугу, для которой не назначена дата',
      );
    if (service.appointment.begDate > new Date())
      throw new BadRequestException('Невозможно закрыть услугу в будущем');

    if (service.status) throw new BadRequestException('Услуга уже закрыта');
    if (!service.course.status)
      throw new BadRequestException('Нельзя закрыть услугу из закрытого курса');

    if (isSpecialist) {
      if (service.appointment.specialist.toString() !== id)
        throw new BadRequestException('Услуга не найдена');
      const now = new Date();
      const nowDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).valueOf();
      const appDate = new Date(service.appointment.begDate)
        .setHours(0, 0, 0, 0)
        .valueOf();
      if (appDate < nowDate)
        throw new BadRequestException('Запись уже нельзя открыть');
    }

    this.serviceModel
      .findByIdAndUpdate(dto.id, { status: true, result: dto.result })
      .exec();
    return;
  }

  async openService(
    dto: OpenServiceDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isSpecialist = roles.find((r) => r === 'specialist');

    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некорректный id услуги');
    const service: any = await this.serviceModel
      .findById(dto.id)
      .populate([
        {
          path: 'appointment',
          model: 'Appointment',
        },
        {
          path: 'course',
          model: 'Course',
        },
      ])
      .exec();
    if (!service) throw new BadRequestException('Услуга не найдена');
    if (!service.status) throw new BadRequestException('Услуга уже открыта');
    if (!service.course.status)
      throw new BadRequestException('Нельзя открыть услугу из закрытого курса');
    if (isSpecialist) {
      if (service.appointment.specialist.toString() !== id)
        throw new BadRequestException('Услуга не найдена');
      const now = new Date();
      const nowDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      ).valueOf();
      const appDate = new Date(service.appointment.begDate)
        .setHours(0, 0, 0, 0)
        .valueOf();
      if (appDate < nowDate)
        throw new BadRequestException('Запись уже нельзя открыть');
    }
    this.serviceModel.findByIdAndUpdate(dto.id, { status: false }).exec();
    return;
  }

  async changeNote(
    dto: ChangeNoteDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isSpecialist = roles.find((r) => r === 'specialist');
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некорректный id услуги');
    const service: any = await this.serviceModel
      .findById(dto.id)
      .populate([
        {
          path: 'appointment',
          model: 'Appointment',
        },
        {
          path: 'course',
          model: 'Course',
        },
      ])
      .exec();
    if (!service) throw new BadRequestException('Услуга не найдена');
    if (service.status) throw new BadRequestException('Услуга уже закрыта');
    if (!service.course.status)
      throw new BadRequestException(
        'Нельзя изменить услугу из закрытого курса',
      );
    if (isSpecialist) {
      if (service.appointment.specialist.toString() !== id)
        throw new BadRequestException('Услуга не найдена');
    }
    this.serviceModel.findByIdAndUpdate(dto.id, { note: dto.note }).exec();
    return;
  }
}
