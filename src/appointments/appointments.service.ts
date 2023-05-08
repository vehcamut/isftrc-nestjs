import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Service,
  AppointmentDocument,
  Appointment,
  User,
  Patient,
  PatientDocument,
  UserDocument,
  ServiceDocument,
} from '../common/schemas';
import {
  AddAppointmentResultDto,
  GetAppointmetnsDto,
  AddAppointmentDto,
  RemoveAppointmentDto,
  GetFreeAppointmetnsDto,
  GetPatientAppointmetnsDto,
  GetAppointmetnsByIdDto,
} from '../common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

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
      throw new BadRequestException('Некорректный id специалиста');
    const candidate = await this.specialistModel
      .findById(dto.specialistId)
      .exec();
    if (!candidate) throw new BadRequestException('Специалист не найден');

    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('Специалист не найден');

    if (isSpec) {
      if (id != dto.specialistId)
        throw new BadRequestException('Специалист не найден');
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

      data.forEach((appointment) => {
        const duration =
          appointment.endDate.getTime() - appointment.begDate.getTime();
        if (duration == numTime) result.push(appointment);
      });

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
      throw new BadRequestException('Некорректный id пациента');
    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('Пациент не найден');
    if (isRepres) {
      const representative = await this.specialistModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('Представитель не найден');
      if (
        !representative.patients.find(
          (p) => p._id.toString() === patient._id.toString(),
        )
      )
        throw new BadRequestException('Пациент не найден');
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
      if (appointment.service.patient._id.toString() === dto.patientId) {
        const canBeRemoved = appointment.service.course.status;
        const service = JSON.parse(JSON.stringify(appointment.service));
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
    if (!mongoose.Types.ObjectId.isValid(dto.specialistId))
      throw new BadRequestException('Специалист не найден');
    const candidate = await this.specialistModel
      .findById(dto.specialistId)
      .exec();
    if (!candidate) throw new BadRequestException('Специалист не найден');
    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('Специалист не найден');
    if (!candidate.isActive)
      throw new BadRequestException('Специалист деактивирован');

    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('Пациент не найден');
    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('Пациент не найден');
    if (!patient.isActive) throw new BadRequestException('Пациент не найден');
    // проверка id записи
    if (!mongoose.Types.ObjectId.isValid(dto.serviceId))
      throw new BadRequestException('Услуга не найдена');
    const currentService: any = await this.serviceModel
      .findById(dto.serviceId)
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
        },
      ])
      .exec();
    if (!currentService) throw new BadRequestException('Услуга не найденв');
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
    return { data: result, count };
  }
  async add(
    dto: AddAppointmentDto,
    id: string,
    roles: string[],
  ): Promise<AddAppointmentResultDto> {
    if (!mongoose.Types.ObjectId.isValid(dto.specialist))
      throw new BadRequestException('Некорректный id специалиста');
    const candidate = await this.specialistModel
      .findById(dto.specialist)
      .exec();
    if (!candidate) throw new BadRequestException('Специалист не найден');
    if (!candidate.roles.includes('specialist'))
      throw new BadRequestException('Специалист не найден');
    if (!candidate.isActive)
      throw new BadRequestException('Специалист деактивирован');

    const hours = dto.time.getHours();
    const minutes = dto.time.getMinutes();
    const result: AddAppointmentResultDto = { amount: 0, notAdded: [] };
    for (let i = 0; i < dto.amount; i++) {
      console.log('1!', dto.begDate);
      const begDate = new Date(dto.begDate);
      dto.begDate.setHours(dto.begDate.getHours() + hours);
      dto.begDate.setMinutes(dto.begDate.getMinutes() + minutes);
      const endDate = new Date(dto.begDate);
      console.log('2!', dto.begDate, begDate, endDate);
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
      if (cand.length) {
        result.notAdded.push({ begDate, endDate });
        continue;
      }
      const newAppointment = new this.appointmentModel({
        begDate,
        endDate,
        specialist: dto.specialist,
      });
      newAppointment.save();
      result.amount++;
    }
    return result;
  }
  async remove(
    dto: RemoveAppointmentDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('Некорректный id записи');
    const appointment = await this.appointmentModel
      .findById(dto._id)
      .populate<{ specialist: User }>([
        {
          path: 'specialist',
          model: 'User',
        },
      ]);
    if (!appointment.specialist.roles.includes('specialist'))
      throw new BadRequestException('Специалист не найден');
    if (!appointment.specialist.isActive)
      throw new BadRequestException('Специалист деактивирован');

    if (appointment.service) {
      this.serviceModel.findByIdAndUpdate(appointment.service._id, {
        $unset: { appointment: 1 },
      });
    }
    this.appointmentModel.findByIdAndDelete(dto._id).exec();
    return;
  }
  async getById(
    dto: GetAppointmetnsByIdDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const isSpec = roles.find((r) => r === 'specialist');
    const isRepres = roles.find((r) => r === 'representative');
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некорректный id записи');
    const query: any = this.appointmentModel.findById(dto.id);
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
    if (!appointment) throw new BadRequestException('Запись не найдена');

    if (isRepres) {
      const representative = await this.specialistModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('Представитель не найден');
      if (
        !representative.patients.find(
          (p) =>
            p._id.toString() === appointment.service.patient._id.toString(),
        )
      )
        throw new BadRequestException('Запись не найдена');
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
