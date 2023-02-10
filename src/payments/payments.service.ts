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
  Appointment,
  AppointmentDocument,
  PatientDocument,
  Patient,
  UserDocument,
  User,
  PaymentDocument,
  Payment,
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
  GetServiseByIdDto,
  ServiceDto,
  AddAppointmentToServiceDto,
  GetTypesDto,
  CloseServiceDto,
  PaymentDto,
  GetAdvanceDto,
  RemoveServiceDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(ServiceGroup.name)
    private serviceGroupModel: Model<ServiceGroupDocument>,
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
    @InjectModel(User.name)
    private representativeModel: Model<UserDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>, // @InjectModel(Appointment.name) // private appointmentModel: Model<AppointmentDocument>,
  ) {}
  async add(dto: PaymentDto, id: string, roles: string[]): Promise<object> {
    // проверка id пациента
    if (!mongoose.Types.ObjectId.isValid(dto.patient))
      throw new BadRequestException('пациент не найден');
    const patient: any = await this.patientModel
      .findById(dto.patient)
      .populate([
        {
          path: 'courses',
          model: 'Course',
        },
      ])
      .exec();
    if (!patient || !patient.isActive)
      throw new BadRequestException('пациент не найден');

    const courses = patient.courses;
    const course = courses.find((course) =>
      dto.inCourse ? course.number === courses.length - 1 : course.number === 0,
    );

    if (dto.groupId) {
      // проверка id группы
      if (!mongoose.Types.ObjectId.isValid(dto.groupId))
        throw new BadRequestException('группа не найдена');
      const group = await this.serviceGroupModel.findById(dto.groupId).exec();
      if (!group || !group.isActive)
        throw new BadRequestException('группа не найдена');
    }

    if (dto.fromTheAdvance) {
      // оплата из аванса
      if (dto.amount < 0)
        throw new BadRequestException('Сумма должна быть положительной');
      const zeroCourse = courses.find((course) => course.number === 0);
      const nowCourse = courses.find(
        (course) => course.number === courses.length - 1,
      );
      const services: any = await this.serviceModel
        .find({ course: zeroCourse._id, status: true })
        .populate([
          {
            path: 'type',
            model: 'ServiceType',
          },
        ])
        .exec();
      const payments = await this.paymentModel
        .find({ course: zeroCourse._id })
        .exec();
      let sum = 0;
      sum += services.reduce(
        (sum, curentServ) => sum - curentServ.type.price,
        sum,
      );
      sum += payments.reduce((sum, curentServ) => sum + curentServ.amount, sum);
      console.log(sum);
      if (sum <= 0 || sum < dto.amount)
        throw new BadRequestException('Не хватает средста на авансе');
      const newMinusPayment = new this.paymentModel({
        name: `Перевод на курс №${courses.length - 1}`,
        date: dto.date,
        amount: dto.amount * -1,
        course: zeroCourse._id,
      });
      await newMinusPayment.save();

      const newPlusPayment = new this.paymentModel({
        name: 'Перевод авансовых средств',
        date: dto.date,
        amount: dto.amount,
        course: nowCourse._id,
        group: dto.groupId,
        relatedPayment: newMinusPayment._id,
      });
      await newPlusPayment.save();
      console.log(newMinusPayment._id, newPlusPayment._id);
      this.paymentModel
        .findByIdAndUpdate(newMinusPayment._id, {
          relatedPayment: newPlusPayment._id,
        })
        .exec();
    } else {
      if (dto.payer) {
        // проверка id представителя
        if (!mongoose.Types.ObjectId.isValid(dto.payer))
          throw new BadRequestException('представитель не найден');
        // const payer = await this.representativeModel.findById(dto.payer).exec();
        const payer = await this.representativeModel
          .findOne({ _id: dto.payer, patients: patient._id })
          .exec();
        if (
          !payer ||
          !payer.isActive ||
          payer.roles.findIndex((r) => r === 'representative') == -1
        )
          throw new BadRequestException('представитель не найден');
        // console.log(payer.patients);
        // if (!payer.patients.find(patient._id))
        //   throw new BadRequestException(
        //     'данный представитель не связан с пациентом',
        //   );
        // console.log('OTLADKA!');
      }
      const newPayment = new this.paymentModel({
        name: dto.name,
        date: dto.date,
        amount: dto.amount,
        course: course._id,
        group: dto.groupId,
        payer: dto.payer,
      });
      console.log(newPayment);
      newPayment.save();
      // }
    }
    return;
  }

  async getAdvance(
    dto: GetAdvanceDto,
    id: string,
    roles: string[],
  ): Promise<number> {
    // проверка id пациента
    if (!mongoose.Types.ObjectId.isValid(dto.patient))
      throw new BadRequestException('пациент не найден');
    const patient: any = await this.patientModel
      .findById(dto.patient)
      .populate([
        {
          path: 'courses',
          model: 'Course',
        },
      ])
      .exec();
    if (!patient || !patient.isActive)
      throw new BadRequestException('пациент не найден');

    const courses = patient.courses;
    const course = courses.find((course) => course.number === 0);
    const services: any = await this.serviceModel
      .find({ course: course._id, status: true })
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
        },
      ])
      .exec();
    const payments = await this.paymentModel
      .find({ course: course._id })
      .exec();
    let sum = 0;
    sum += services.reduce(
      (sum, curentServ) => sum - curentServ.type.price,
      sum,
    );
    sum += payments.reduce((sum, curentServ) => sum + curentServ.amount, sum);

    return sum;
  }

  async remove(
    dto: RemoveServiceDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // поиск паиента и курсов
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('оплата не найдена');
    const payment: any = await this.paymentModel
      .findById(dto.id)
      .populate([
        {
          path: 'relatedPayment',
          model: 'Payment',
          populate: {
            path: 'course',
            model: 'Course',
          },
        },
        {
          path: 'course',
          model: 'Course',
        },
      ])
      .exec();
    if (!payment) throw new BadRequestException('оплата не найдена');
    if (
      !payment.course.status ||
      (payment.relatedPayment && !payment.relatedPayment.course.status)
    )
      throw new BadRequestException(
        'оплата не может быть удалена, так как курс уже закрыт',
      );
    if (payment.relatedPayment)
      this.paymentModel.findByIdAndRemove(payment.relatedPayment.id).exec();
    this.paymentModel.findByIdAndRemove(payment.id).exec();
    return;
  }

  async getById(
    dto: GetServiseByIdDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    //todo проверка на принадлежность пациента
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('id оплаты не найден');

    const payment: any = await this.paymentModel
      .findById({ _id: dto.id })
      .populate([
        {
          path: 'payer',
          model: 'User',
          select: { name: 1, surname: 1, patronymic: 1, isActive: 1 },
        },
        {
          path: 'group',
          model: 'ServiceGroup',
          select: { name: 1, isActive: 1 },
        },
        {
          path: 'relatedPayment',
          model: 'Payment',
          populate: {
            path: 'course',
            model: 'Course',
          },
        },
        {
          path: 'course',
          model: 'Course',
        },
      ]);

    if (!payment) throw new BadRequestException('id услуги не найден');

    const canRemove = !(
      !payment.course.status ||
      (payment.relatedPayment && !payment.relatedPayment.course.status)
    );

    return {
      id: payment._id,
      name: payment.name,
      group: payment?.group?.name,
      amount: payment.amount,
      date: payment.date,
      payer: payment.payer
        ? `${payment.payer.surname} ${payment.payer.name[0]}.${payment.payer.patronymic[0]}.`
        : undefined,
      canRemove,
    };
  }
  // async get(dto: GetServiceDto): Promise<any> {
  //   const findCond = {
  //     $and: [
  //       {
  //         $or: [{ name: { $regex: `${dto.filter}`, $options: 'i' } }],
  //       },
  //     ],
  //   };

  //   const groups = await this.serviceGroupModel
  //     .find()
  //     .select('name isActive _id')
  //     .exec();

  //   const types = await this.serviceTypeModel
  //     .find(findCond)
  //     .select('name isActive group time price _id defaultAmountPatient')
  //     .populate(
  //       'specialistTypes',
  //       'isActive name _id',
  //       this.specialistTypeModel,
  //       {
  //         isActive: true,
  //       },
  //     )
  //     .exec();
  //   const groupsWithType: ServiceGroupWithTypesDto[] = [];
  //   groups.forEach((group) => {
  //     groupsWithType.push({
  //       _id: group._id.toString(),
  //       isActive: group.isActive,
  //       name: group.name,
  //       types: [],
  //     });
  //   });
  //   types.forEach(async (type) => {
  //     const gr = await groupsWithType.find((el) => {
  //       return el._id === type.group.toString();
  //     });
  //     gr.types.push({
  //       _id: type._id,
  //       name: type.name,
  //       isActive: type.isActive,
  //       group: type.group.toString(),
  //       specialistTypes: type.specialistTypes,
  //       price: type.price,
  //       time: type.time,
  //       defaultAmountPatient: type.defaultAmountPatient,
  //     });
  //   });
  //   console.log(groupsWithType);
  //   return groupsWithType;
  // }

  // async getGroups(dto: GetServiceDto): Promise<any> {
  //   const groups = this.serviceGroupModel
  //     .find({
  //       isActive: true,
  //     })
  //     .select('name _id')
  //     .exec();

  //   return groups;
  // }

  // async getTypes(dto: GetTypesDto): Promise<any> {
  //   if (!mongoose.Types.ObjectId.isValid(dto.group))
  //     throw new BadRequestException('группа услуг не найдена');
  //   const group = await this.serviceGroupModel.findById(dto.group).exec();
  //   if (!group) throw new BadRequestException('группа услуг не найдена');

  //   const types = this.serviceTypeModel
  //     .find({
  //       group: group._id,
  //       isActive: true,
  //     })
  //     .select('name _id')
  //     .exec();

  //   return types;
  // }

  // async getAllInfoService(
  //   dto: GetServiseByIdDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<any> {
  //   //todo проверка на принадлежность пациента
  //   if (!mongoose.Types.ObjectId.isValid(dto.id))
  //     throw new BadRequestException('id услуги не найден');

  //   const service: any = await this.serviceModel
  //     .findOne({ _id: dto.id })
  //     .populate([
  //       {
  //         path: 'type',
  //         model: 'ServiceType',
  //       },
  //       {
  //         path: 'patient',
  //         model: 'Patient',
  //       },
  //       {
  //         path: 'appointment',
  //         model: 'Appointment',
  //         populate: {
  //           path: 'specialist',
  //           model: 'User',
  //           select: {
  //             name: 1,
  //             surname: 1,
  //             patronymic: 1,
  //             isActive: 1,
  //           },
  //         },
  //       },
  //     ]);
  //   console.log(service);
  //   if (!service) throw new BadRequestException('id услуги не найден');

  //   return service;
  // }

  // async getService(
  //   dto: GetServiseByIdDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<any> {
  //   //todo проверка на принадлежность пациента
  //   if (!mongoose.Types.ObjectId.isValid(dto.id))
  //     throw new BadRequestException('id услуги не найден');

  //   const service: any = await this.serviceModel
  //     .findOne({ _id: dto.id })
  //     .select('_id status course type result note patient appointment')
  //     .populate([
  //       {
  //         path: 'type',
  //         model: 'ServiceType',
  //         select: { name: 1, isActive: 1, price: 1, time: 1, _id: 1 },
  //       },
  //       {
  //         path: 'patient',
  //         model: 'Patient',
  //         select: { name: 1, surname: 1, patronymic: 1, isActive: 1 },
  //       },
  //       {
  //         path: 'appointment',
  //         model: 'Appointment',
  //         select: {
  //           begDate: 1,
  //           // name: 1,
  //           specialist: 1,
  //         },
  //         populate: {
  //           path: 'specialist',
  //           model: 'User',
  //           select: {
  //             name: 1,
  //             surname: 1,
  //             patronymic: 1,
  //             isActive: 1,
  //           },
  //         },
  //       },
  //     ]);
  //   console.log(service);
  //   if (!service) throw new BadRequestException('id услуги не найден');

  //   return {
  //     id: service._id,
  //     type: service.type.name,
  //     status: service.status,
  //     course: service.course,
  //     result: service.result,
  //     note: service.note,
  //     number: service.number,
  //     date: service?.appointment?.begDate,
  //     specialist: service?.appointment
  //       ? `${service?.appointment?.specialist.surname} ${service?.appointment?.specialist.name} ${service?.appointment?.specialist.patronymic}`
  //       : undefined,
  //     patient: `${service.patient.surname} ${service.patient.name} ${service.patient.patronymic}`,
  //   };
  // }

  // async addGroup(
  //   dto: ServiceGroupDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   const cand = await this.serviceGroupModel
  //     .findOne({ name: dto.name })
  //     .exec();
  //   if (cand) throw new BadRequestException('Название должно быть уникальным');
  //   //console.log(dto);
  //   const group = await this.serviceGroupModel.create(dto);
  //   const newGroup = new this.serviceGroupModel(group);
  //   newGroup.save();
  //   return;
  // }

  // async addType(
  //   dto: ServiceTypeDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   const cand = await this.serviceTypeModel.findOne({ name: dto.name }).exec();
  //   if (cand) throw new BadRequestException('Название должно быть уникальным');

  //   if (!mongoose.Types.ObjectId.isValid(dto.group))
  //     throw new BadRequestException('id группы услуг не найден');

  //   const candidate = await this.serviceGroupModel.findById(dto.group).exec();
  //   if (!candidate) throw new BadRequestException('id группы услуг не найден');

  //   const specialistTypes: Types.ObjectId[] = [];

  //   for (let i = 0; i < dto.specialistTypes.length; i++) {
  //     try {
  //       specialistTypes.push(new Types.ObjectId(dto.specialistTypes[i]));
  //       //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
  //     } catch (e) {
  //       console.log(e);
  //       throw new BadRequestException(
  //         `Неизвестная специальность: ${dto.specialistTypes[i]}`,
  //       );
  //     }

  //     const candidate = await this.specialistTypeModel.findById(
  //       specialistTypes[i],
  //     );
  //     if (!candidate)
  //       throw new BadRequestException(
  //         `Неизвестная специальность: ${dto.specialistTypes[i]}`,
  //       );
  //   }

  //   const type = await this.serviceTypeModel.create({
  //     ...dto,
  //     specialistTypes,
  //   });
  //   const newType = new this.serviceTypeModel(type);
  //   newType.save();
  //   return;
  // }

  // async updateGroup(
  //   dto: ServiceGroupWithIdDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (!mongoose.Types.ObjectId.isValid(dto._id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.serviceGroupModel.findById(dto._id).exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   const count = await this.serviceGroupModel
  //     .findOne({ name: dto.name })
  //     .exec();
  //   if (count && count._id.toString() !== dto._id)
  //     throw new BadRequestException('Название должно быть уникальным');
  //   this.serviceGroupModel.findByIdAndUpdate(dto._id, dto).exec();
  //   return;
  // }

  // async updateType(
  //   dto: ServiceTypeWithIdDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (!mongoose.Types.ObjectId.isValid(dto._id))
  //     throw new BadRequestException('id услуги не найден');
  //   const candidate = await this.serviceTypeModel.findById(dto._id).exec();
  //   if (!candidate) throw new BadRequestException('id услуги не найден');
  //   const count = await this.serviceTypeModel
  //     .findOne({ name: dto.name })
  //     .exec();
  //   if (count && count._id.toString() !== dto._id)
  //     throw new BadRequestException('Название должно быть уникальным');

  //   if (!mongoose.Types.ObjectId.isValid(dto.group))
  //     throw new BadRequestException('id группы услуг не найден');

  //   const groupCand = await this.serviceGroupModel.findById(dto.group).exec();
  //   if (!groupCand) throw new BadRequestException('id группы услуг не найден');

  //   const specialistTypes: Types.ObjectId[] = [];

  //   for (let i = 0; i < dto.specialistTypes.length; i++) {
  //     try {
  //       specialistTypes.push(new Types.ObjectId(dto.specialistTypes[i]));
  //       //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
  //     } catch (e) {
  //       console.log(e);
  //       throw new BadRequestException(
  //         `Неизвестная специальность: ${dto.specialistTypes[i]}`,
  //       );
  //     }

  //     const candidate = await this.specialistTypeModel.findById(
  //       specialistTypes[i],
  //     );
  //     if (!candidate)
  //       throw new BadRequestException(
  //         `Неизвестная специальность: ${dto.specialistTypes[i]}`,
  //       );
  //   }

  //   this.serviceTypeModel
  //     .findByIdAndUpdate(dto._id, { ...dto, specialistTypes })
  //     .exec();
  //   return;
  // }

  // async setAppointment(
  //   dto: AddAppointmentToServiceDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   // проверка id услуги
  //   if (!mongoose.Types.ObjectId.isValid(dto.serviceId))
  //     throw new BadRequestException('услуга не найдена');
  //   const service: any = await this.serviceModel
  //     .findById(dto.serviceId)
  //     .populate([
  //       {
  //         path: 'type',
  //         model: 'ServiceType',
  //       },
  //     ])
  //     .exec();
  //   if (!service) throw new BadRequestException('услуга не найдена');
  //   //todo: здесь сразу отвязывается старое время
  //   if (service.appointment) {
  //     const currentAppointment = await this.appointmentModel
  //       .findById(service.appointment)
  //       .exec();
  //     this.appointmentModel
  //       .findByIdAndUpdate(currentAppointment._id, {
  //         service: null,
  //       })
  //       .exec();
  //     // throw new BadRequestException('услуга уже записана');
  //   }
  //   // проверка id записи
  //   if (!mongoose.Types.ObjectId.isValid(dto.appointmentId))
  //     throw new BadRequestException('запись не найдена');
  //   const appointment = await this.appointmentModel
  //     .findById(dto.appointmentId)
  //     .exec();
  //   if (!appointment) throw new BadRequestException('запись не найдена');
  //   if (appointment.service)
  //     throw new BadRequestException('данное время уже занято');
  //   const time =
  //     (service.type.time.getHours() * 60 + service.type.time.getMinutes()) *
  //     60 *
  //     1000;
  //   console.log('!!!!!!!!', time);
  //   const duration =
  //     appointment.endDate.getTime() - appointment.begDate.getTime();
  //   if (duration == time) {
  //     this.serviceModel
  //       .findByIdAndUpdate(service._id, {
  //         appointment: new Types.ObjectId(appointment._id),
  //       })
  //       .exec();
  //     this.appointmentModel
  //       .findByIdAndUpdate(appointment._id, {
  //         service: new Types.ObjectId(service._id),
  //       })
  //       .exec();
  //   } else
  //     throw new BadRequestException('Данное время не подходит по длительности');
  //   return;
  // }

  // async closeService(
  //   dto: CloseServiceDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   //todo врач может закрывать только в тот же день, только свои услуги
  //   // проверка id услуги
  //   if (!mongoose.Types.ObjectId.isValid(dto.id))
  //     throw new BadRequestException('услуга не найдена');
  //   const service: any = await this.serviceModel
  //     .findById(dto.id)
  //     .populate([
  //       // {
  //       //   path: 'type',
  //       //   model: 'ServiceType',
  //       // },
  //       {
  //         path: 'appointment',
  //         model: 'Appointment',
  //       },
  //     ])
  //     .exec();
  //   if (!service) throw new BadRequestException('услуга не найдена');
  //   // if (service.status) throw new BadRequestException('услуга уже закрыта');
  //   if (!service.appointment)
  //     throw new BadRequestException(
  //       'не возможно закрыть услугу, для которой не назначена дата',
  //     );
  //   if (service.appointment.endDate > new Date())
  //     throw new BadRequestException('не возможно закрыть услугу в будущем');
  //   // // const updateData: any = {
  //   //   result: dto.result,
  //   // };
  //   // if (!service.status) {
  //   //   const courseId = service.course;
  //   //   const typeId = service.type;
  //   //   const services = await this.serviceModel
  //   //     .find({
  //   //       status: true,
  //   //       course: courseId,
  //   //       type: typeId,
  //   //     })
  //   //     .exec();
  //   //   // services.find()
  //   //   updateData.status = true;
  //   //   // updateData.number = services.length + 1;
  //   // }
  //   //todo: здесь сразу отвязывается старое время
  //   // console.log(updateData);
  //   this.serviceModel
  //     .findByIdAndUpdate(dto.id, { status: true, result: dto.result })
  //     .exec();
  //   // проверка id записи
  //   return;
  // }
}
