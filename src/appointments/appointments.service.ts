import {
  GetSpecialistsDto,
  GetSpecialistsByIdDto,
  AddSpecialistDto,
} from '../common/dtos/specialist.dto';
import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Service,
  AppointmentDocument,
  Appointment,
  User,
  Patient,
  PatientDocument,
  UserDocument,
  AdvertisingSource,
  AdvertisingSourceDocument,
  SpecialistTypeDocument,
  SpecialistType,
  ServiceDocument,
} from 'src/common/schemas';
import * as bcrypt from 'bcrypt';
import {
  AddAppointmentResultDto,
  AddBaseUserDto,
  AddPatientToRepresentative,
  AddRepresentativeDto,
  GetPatientsDto,
  GetRepresentativesByIdDto,
  GetRepresentativesDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  RepresentativeWithIdDto,
  SpecialistWithIdDto,
  SpecialistChangeStatusDto,
  GetAppointmetnsDto,
  AppointmentDto,
  AddAppointmentDto,
  AppointmentWithIdDto,
  RemoveAppointmentDto,
  GetFreeAppointmetnsDto,
  GetPatientAppointmetnsDto,
  GetAppointmetnsByIdDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { hashDataSHA512 } from '../common/common';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectModel(User.name)
    private specialistModel: Model<UserDocument>,
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
  ) {}
  async get(
    dto: GetAppointmetnsDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const isSpec = roles.find((r) => r === 'specialist');
    if (!mongoose.Types.ObjectId.isValid(dto.specialistId))
      throw new BadRequestException('некорректный id специалиста');
    const candidate = await this.specialistModel
      .findById(dto.specialistId)
      .exec();
    if (!candidate) throw new BadRequestException('специалист не найден');

    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');

    if (isSpec) {
      if (id != dto.specialistId)
        throw new BadRequestException('специалист не найден');
    }

    const findCond = {
      $and: [
        dto.begDate
          ? {
              begDate: { $gte: dto.begDate },
            }
          : {},
        dto.endDate
          ? {
              endDate: { $lte: dto.endDate },
            }
          : {},
        {
          specialist: dto.specialistId,
        },
        dto.isFree
          ? {
              service: null,
            }
          : {},
        dto.isFree
          ? {
              begDate: { $gte: new Date() },
            }
          : {},
      ],
    };
    const query = this.appointmentModel.find(findCond);
    const count = await this.appointmentModel.find(findCond).count().exec();
    query
      .sort({ begDate: 1 })
      .select('_id begDate endDate service specialist')
      .populate([
        {
          path: 'service',
          model: 'Service',
          select: {
            type: 1,
            isActive: 1,
            status: 1,
            course: 1,
            result: 1,
            number: 1,
            note: 1,
            patient: 1,
          },
          populate: [
            {
              path: 'type',
              model: 'ServiceType',
              select: {
                name: 1,
                time: 1,
              },
              // transform(doc, id) {
              //   console.log(doc);
              //   return doc;
              // },
            },
            {
              path: 'patient',
              model: 'Patient',
              select: {
                name: 1,
                surname: 1,
                patronymic: 1,
                number: 1,
              },
              // transform(doc, id) {
              //   console.log(doc);
              //   return doc;
              // },
            },
          ],
        },
        {
          path: 'specialist',
          model: 'User',
          select: {
            isActive: 1,
            name: 1,
            surname: 1,
            patronymic: 1,
          },
          transform: (doc, id) => {
            return {
              _id: id,
              name: `${doc.surname} ${doc.name[0]}.${doc.patronymic[0]}.`,
            };
          },
        },
      ]);
    const result: any = [];
    const data = await query.exec();
    if (dto.time) {
      const time = new Date(dto.time.setHours(dto.time.getHours()));
      const numTime =
        (dto.time.getHours() * 60 + dto.time.getMinutes()) * 60 * 1000;
      // console.log(numTime);
      data.forEach((appointment) => {
        const duration =
          appointment.endDate.getTime() - appointment.begDate.getTime();
        console.log(duration - numTime);
        if (duration == numTime) result.push(appointment);
      });
      // console.log(result);
      return { data: result, count };
    } else return { data, count };
  }
  async getForPatient(
    dto: GetPatientAppointmetnsDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const isSpec = roles.find((r) => r === 'specialist');
    const isRepres = roles.find((r) => r === 'representative');
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('некорректный id пациента');
    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    if (isRepres) {
      const representative = await this.specialistModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      if (
        !representative.patients.find(
          (p) => p._id.toString() === patient._id.toString(),
        )
      )
        throw new BadRequestException('пациент не найден');
    }
    const findCond = {
      $and: [
        dto.begDate
          ? {
              begDate: { $gte: dto.begDate },
            }
          : {},
        dto.endDate
          ? {
              endDate: { $lte: dto.endDate },
            }
          : {},
        {
          service: { $ne: null },
        },
      ],
    };
    const query: any = this.appointmentModel.find(findCond);
    // const count = await this.appointmentModel.find(findCond).count().exec();
    query
      .sort({ begDate: 1 })
      .select('_id begDate endDate service specialist')
      .populate([
        {
          path: 'service',
          model: 'Service',
          select: {
            type: 1,
            isActive: 1,
            status: 1,
            course: 1,
            result: 1,
            number: 1,
            note: 1,
            patient: 1,
          },
          populate: [
            {
              path: 'course',
              model: 'Course',
              select: {
                number: 1,
                status: 1,
              },
            },
            {
              path: 'type',
              model: 'ServiceType',
              select: {
                name: 1,
                time: 1,
              },
            },
            {
              path: 'patient',
              model: 'Patient',
              select: {
                name: 1,
                surname: 1,
                patronymic: 1,
                number: 1,
              },
            },
          ],
          // transform(doc, id) {
          //   doc.canBeRemoved = doc.course.status;
          //   console.log('!!!', doc);
          //   return doc;
          // },
        },
        {
          path: 'specialist',
          model: 'User',
          select: {
            isActive: 1,
            name: 1,
            surname: 1,
            patronymic: 1,
          },
          transform: (doc, id) => {
            return {
              _id: id,
              name: `${doc.surname} ${doc.name[0]}.${doc.patronymic[0]}.`,
            };
          },
        },
      ]);
    const result: any = [];
    const appointments = await query.exec();
    appointments.forEach((appointment) => {
      // console.log(appointment.service.patient._id, '!!!', patient._id);
      if (appointment.service.patient._id.toString() === dto.patientId) {
        const canBeRemoved = appointment.service.course.status;
        // let canBeRemoved = true;
        // if (appointment.service.course.status == false) canBeRemoved = false;
        // console.log(canBeRemoved);
        const service = JSON.parse(JSON.stringify(appointment.service));
        // const service.toH
        // result.push(appointment);
        result.push({
          _id: appointment._id,
          begDate: appointment.begDate,
          endDate: appointment.endDate,
          specialist: appointment.specialist,
          service: { ...service, canBeRemoved },
        });
      }
    });
    return { data: result, count: result.length };
  }
  async getForRecord(
    dto: GetFreeAppointmetnsDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // проверка id специалиста
    if (!mongoose.Types.ObjectId.isValid(dto.specialistId))
      throw new BadRequestException('специалист не найден');
    const candidate = await this.specialistModel
      .findById(dto.specialistId)
      .exec();
    if (!candidate) throw new BadRequestException('специалист не найден');
    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');
    if (!candidate.isActive)
      throw new BadRequestException('специалист деактивирован');

    // проверка id пациента
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('пациент не найден');
    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    if (!patient.isActive) throw new BadRequestException('пациент не найден');
    // проверка id записи
    if (!mongoose.Types.ObjectId.isValid(dto.serviceId))
      throw new BadRequestException('услуга не найдена');
    const currentService: any = await this.serviceModel
      .findById(dto.serviceId)
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
        },
      ])
      .exec();
    if (!currentService) throw new BadRequestException('услуга не найденв');
    // if (!currentService.isActive) throw new BadRequestException('услуга не найдена');
    // поиск свободных записей у специалиста
    const findCond = {
      $and: [
        dto.begDate
          ? {
              begDate: { $gte: dto.begDate },
            }
          : {},
        dto.endDate
          ? {
              endDate: { $lte: dto.endDate },
            }
          : {},
        {
          specialist: dto.specialistId,
        },
        {
          service: null,
        },
        {
          begDate: { $gte: new Date() },
        },
      ],
    };
    const query = this.appointmentModel.find(findCond);
    const count = await this.appointmentModel.find(findCond).count().exec();
    query
      .sort({ begDate: 1 })
      .select('_id begDate endDate service specialist')
      .populate([
        {
          path: 'service',
          model: 'Service',
          select: {
            type: 1,
            isActive: 1,
            status: 1,
            course: 1,
            result: 1,
            number: 1,
            note: 1,
            patient: 1,
          },
          populate: [
            {
              path: 'type',
              model: 'ServiceType',
              select: {
                name: 1,
                time: 1,
              },
              // transform(doc, id) {
              //   console.log(doc);
              //   return doc;
              // },
            },
            {
              path: 'patient',
              model: 'Patient',
              select: {
                name: 1,
                surname: 1,
                patronymic: 1,
                number: 1,
              },
              // transform(doc, id) {
              //   console.log(doc);
              //   return doc;
              // },
            },
          ],
        },
        {
          path: 'specialist',
          model: 'User',
          select: {
            isActive: 1,
            name: 1,
            surname: 1,
            patronymic: 1,
          },
          transform: (doc, id) => {
            return {
              _id: id,
              name: `${doc.surname} ${doc.name[0]}.${doc.patronymic[0]}.`,
            };
          },
        },
      ]);
    const appointments = await query.exec();
    //поиск записей пациента
    //todo проверить несостыковки
    const services = await this.serviceModel
      .find({
        $and: [
          {
            patient: dto.patientId,
          },
          {
            $not: { appointment: null },
          },
        ],
      })
      .populate([
        {
          path: 'appointment',
          model: 'Appointment',
        },
      ])
      .exec();
    const result: any = [];
    const time =
      (currentService.type.time.getHours() * 60 +
        currentService.type.time.getMinutes()) *
      60 *
      1000;
    // console.log('!!!!!!!!', time);
    appointments.forEach((appointment) => {
      const duration =
        appointment.endDate.getTime() - appointment.begDate.getTime();
      if (duration == time)
        if (
          services.findIndex(
            (service: any) =>
              service.appointment &&
              ((appointment.begDate <= service.appointment.begDate &&
                appointment.begDate > service.appointment.endDate) ||
                (appointment.endDate > service.appointment.begDate &&
                  appointment.endDate <= service.appointment.endDate)),
          ) == -1
        )
          result.push(appointment);
    });
    // console.log(result);
    return { data: result, count };
  }
  async add(
    dto: AddAppointmentDto,
    id: string,
    roles: string[],
  ): Promise<AddAppointmentResultDto> {
    if (!mongoose.Types.ObjectId.isValid(dto.specialist))
      throw new BadRequestException('некорректный id специалиста');
    const candidate = await this.specialistModel
      .findById(dto.specialist)
      .exec();
    if (!candidate) throw new BadRequestException('специалист не найден');
    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');
    if (!candidate.isActive)
      throw new BadRequestException('специалист деактивирован');

    const hours = dto.time.getHours();
    const minutes = dto.time.getMinutes();
    const result: AddAppointmentResultDto = { amount: 0, notAdded: [] };
    for (let i = 0; i < dto.amount; i++) {
      const begDate = new Date(dto.begDate);
      dto.begDate.setHours(dto.begDate.getHours() + hours);
      dto.begDate.setMinutes(dto.begDate.getMinutes() + minutes);
      const endDate = new Date(dto.begDate);
      // console.log(begDate, endDate);
      const findCond = {
        $and: [
          {
            specialist: dto.specialist,
          },
          {
            $or: [
              {
                $and: [
                  {
                    begDate: { $gt: begDate },
                  },
                  {
                    begDate: { $lt: endDate },
                  },
                ],
              },
              {
                $and: [
                  {
                    endDate: { $gt: begDate },
                  },
                  {
                    endDate: { $lt: endDate },
                  },
                ],
              },
              {
                $and: [
                  {
                    begDate: { $lte: begDate },
                  },
                  {
                    endDate: { $gt: begDate },
                  },
                ],
              },
              {
                $and: [
                  {
                    begDate: { $lt: endDate },
                  },
                  {
                    endDate: { $gte: endDate },
                  },
                ],
              },
            ],
          },
        ],
      };
      const cand = await this.appointmentModel.find(findCond).exec();
      // console.log(cand);
      // if (cand.length) throw new BadRequestException('Данное время уже занято');
      if (
        cand.length
        // &&
        // begDate.toLocaleString('ru-RU', {
        //   year: '2-digit',
        //   month: '2-digit',
        //   day: '2-digit',
        // }) !==
        //   endDate.toLocaleString('ru-RU', {
        //     year: '2-digit',
        //     month: '2-digit',
        //     day: '2-digit',
        //   })
      ) {
        result.notAdded.push({ begDate, endDate });
        continue;
      }
      // const appointment = await this.appointmentModel.create(dto);
      const newAppointment = new this.appointmentModel({
        begDate,
        endDate,
        specialist: dto.specialist,
      });
      newAppointment.save();
      result.amount++;
    }
    return result;
    //todo: проверка кто добавляет время
  }
  async remove(
    dto: RemoveAppointmentDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('некорректный id записи');
    const appointment = await this.appointmentModel
      .findById(dto._id)
      .populate<{ specialist: User }>([
        {
          path: 'specialist',
          model: 'User',
        },
      ]);
    // const candidate = await this.specialistModel
    //   .findById(dto.specialist)
    //   .exec();
    // if (!candidate) throw new BadRequestException('специалист не найден');
    if (!appointment.specialist.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');
    if (!appointment.specialist.isActive)
      throw new BadRequestException('специалист деактивирован');

    if (appointment.service) {
      this.serviceModel.findByIdAndUpdate(appointment.service._id, {
        $unset: { appointment: 1 },
      });
    }
    this.appointmentModel.findByIdAndDelete(dto._id).exec();
    return;
    //todo: проверка кто добавляет время
  }
  async getById(
    dto: GetAppointmetnsByIdDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    //TODO: Может ли впач видеть чужие услуги
    const isSpec = roles.find((r) => r === 'specialist');
    const isRepres = roles.find((r) => r === 'representative');
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('запись не найдена');
    const query: any = this.appointmentModel.findById(dto.id);
    // const count = await this.appointmentModel.find(findCond).count().exec();
    query.select('_id begDate endDate service specialist').populate([
      {
        path: 'service',
        model: 'Service',
        select: {
          type: 1,
          isActive: 1,
          status: 1,
          course: 1,
          result: 1,
          number: 1,
          note: 1,
          patient: 1,
        },
        populate: [
          {
            path: 'course',
            model: 'Course',
            select: {
              number: 1,
              status: 1,
            },
          },
          {
            path: 'type',
            model: 'ServiceType',
            select: {
              name: 1,
              time: 1,
            },
          },
          {
            path: 'patient',
            model: 'Patient',
            select: {
              name: 1,
              surname: 1,
              patronymic: 1,
              number: 1,
              isActive: 1,
            },
          },
        ],
      },
      {
        path: 'specialist',
        model: 'User',
        select: {
          isActive: 1,
          name: 1,
          surname: 1,
          patronymic: 1,
        },
        transform: (doc, id) => {
          return {
            isActive: doc.isActive,
            _id: id,
            name: `${doc.surname} ${doc.name[0]}.${doc.patronymic[0]}.`,
          };
        },
      },
    ]);
    const appointment = await query.exec();
    if (!appointment) throw new BadRequestException('запись не найдена');

    if (isRepres) {
      const representative = await this.specialistModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      if (
        !representative.patients.find(
          (p) =>
            p._id.toString() === appointment.service.patient._id.toString(),
        )
      )
        throw new BadRequestException('запись не найдена');
    }

    const service = appointment.service
      ? JSON.parse(JSON.stringify(appointment.service))
      : undefined;
    const canBeRemoved = appointment.service
      ? appointment.service.course.status
      : undefined;
    if (isRepres && service) delete service.note;
    return {
      _id: appointment._id,
      begDate: appointment.begDate,
      endDate: appointment.endDate,
      specialist: appointment.specialist,
      service: service ? { ...service, canBeRemoved } : undefined,
    };
  }
}
