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
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { hashDataSHA512 } from 'src/common/common';

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
    if (!mongoose.Types.ObjectId.isValid(dto.specialistId))
      throw new BadRequestException('_id: not found');
    const candidate = await this.specialistModel
      .findById(dto.specialistId)
      .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    if (!candidate.isActive || !candidate.roles.includes('specialist'))
      throw new BadRequestException('bad specialist');
    // const date = new Date(dto.date.toDateString());

    // const beg = new Date(date).setMonth(date.getMonth() - 1);
    // const end = new Date(date).setMonth(date.getMonth() + 1);
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
      console.log(numTime);
      data.forEach((appointment) => {
        const duration =
          appointment.endDate.getTime() - appointment.begDate.getTime();
        console.log(duration - numTime);
        if (duration == numTime) result.push(appointment);
      });
      console.log(result);
      return { data: result, count };
    } else return { data, count };
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
    if (!candidate.isActive || !candidate.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');
    // проверка id пациента
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('пациент не найден');
    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    if (!patient.isActive) throw new BadRequestException('пациент не найден');
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
            appointment: {
              $not: null,
            },
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
    const time = (dto.time.getHours() * 60 + dto.time.getMinutes()) * 60 * 1000;
    appointments.forEach((appointment) => {
      const duration =
        appointment.endDate.getTime() - appointment.begDate.getTime();
      if (duration == time)
        if (
          services.findIndex(
            (service: any) =>
              (appointment.begDate <= service.appointment.begDate &&
                appointment.begDate > service.appointment.endDate) ||
              (appointment.endDate > service.appointment.begDate &&
                appointment.endDate <= service.appointment.endDate),
          ) == -1
        )
          result.push(appointment);
    });
    console.log(result);
    return { data: result, count };
  }
  async add(
    dto: AddAppointmentDto,
    id: string,
    roles: string[],
  ): Promise<AddAppointmentResultDto> {
    if (!mongoose.Types.ObjectId.isValid(dto.specialist))
      throw new BadRequestException('специалист не найден');
    const candidate = await this.specialistModel
      .findById(dto.specialist)
      .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    if (!candidate.isActive || !candidate.roles.includes('specialist'))
      throw new BadRequestException('специалист не найден');

    const hours = dto.time.getHours();
    const minutes = dto.time.getMinutes();
    const result: AddAppointmentResultDto = { amount: 0, notAdded: [] };
    for (let i = 0; i < dto.amount; i++) {
      const begDate = new Date(dto.begDate);
      dto.begDate.setHours(dto.begDate.getHours() + hours);
      dto.begDate.setMinutes(dto.begDate.getMinutes() + minutes);
      const endDate = new Date(dto.begDate);
      console.log(begDate, endDate);
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
      console.log(cand);
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
      throw new BadRequestException('запись не найдена');
    const candidate = await this.appointmentModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('запись не найдена');
    if (candidate.service) {
      this.serviceModel.findByIdAndUpdate(candidate.service._id, {
        $unset: { appointment: 1 },
      });
    }
    this.appointmentModel.findByIdAndDelete(dto._id).exec();
    return;
    //todo: проверка кто добавляет время
  }
  // async get(dto: GetSpecialistsDto): Promise<any> {
  //   // let patientId;
  //   // if (dto.patientId) {
  //   //   if (!mongoose.Types.ObjectId.isValid(dto.patientId))
  //   //     throw new BadRequestException('_id: not found');
  //   //   const candidate = await this.patientModel.findById(dto.patientId).exec();
  //   //   if (!candidate) throw new BadRequestException('_id: not found');
  //   //   patientId = dto.patientId;
  //   // }
  //   // console.log('PP', patientId);
  //   const findCond = {
  //     $and: [
  //       // patientId
  //       //   ? {
  //       //       patients: {
  //       //         $not: { $elemMatch: { $in: [patientId] } },
  //       //       },
  //       //     }
  //       //   : {},
  //       {
  //         $or: [
  //           { name: { $regex: `${dto.filter}`, $options: 'i' } },
  //           { surname: { $regex: `${dto.filter}`, $options: 'i' } },
  //           { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
  //           { phoneNumbers: { $regex: `${dto.filter}`, $options: 'i' } },
  //           { emails: { $regex: `${dto.filter}`, $options: 'i' } },
  //           { address: { $regex: `${dto.filter}`, $options: 'i' } },
  //           { login: { $regex: `${dto.filter}`, $options: 'i' } },
  //         ],
  //       },
  //       { roles: { $in: ['specialist'] } },
  //       dto.gender
  //         ? {
  //             gender: dto.gender,
  //           }
  //         : {},
  //       dto.isActive !== undefined
  //         ? {
  //             isActive: dto.isActive,
  //           }
  //         : {},
  //     ],
  //   };
  //   const query = this.specialistModel.find(findCond);
  //   const count = await this.specialistModel.find(findCond).count().exec();
  //   if (dto.sort)
  //     query.sort({
  //       [dto.sort]: dto.order as SortOrder,
  //     });

  //   query
  //     .skip(dto.page * dto.limit)
  //     .limit(dto.limit)
  //     .select(
  //       'name surname patronymic dateOfBirth phoneNumbers emails gender address isActive types _id login',
  //     );
  //   const data = await query.exec();
  //   return { data, count };
  // }

  // async getById(dto: GetSpecialistsByIdDto): Promise<any> {
  //   const candidate = await this.specialistModel
  //     .findById(dto.id)
  //     .select(
  //       'name surname patronymic dateOfBirth gender address isActive phoneNumbers emails login _id types',
  //     )
  //     .populate('types', 'name _id', this.specialistTypeModel, {
  //       isActive: true,
  //     })
  //     .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   console.log(candidate);
  //   // candidate.advertisingSources.forEach(async function (value, index) {
  //   //   const id = this[index];
  //   //   const cand = await this.advertisingSourceModel
  //   //     .findById(id)
  //   //     .select('name _id isActive')
  //   //     .exec();

  //   //   if (cand && cand.isActive) {
  //   //     this[index] = { _id: cand._id, name: cand.name };
  //   //   }
  //   // }, candidate.advertisingSources);

  //   return candidate;
  // }

  // async add(
  //   dto: AddSpecialistDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   const count = await this.specialistModel
  //     .findOne({ login: dto.login })
  //     .exec();
  //   if (count) throw new BadRequestException('Логин должен быть уникальным');
  //   let hashedPassword: string;

  //   if (dto.hash) hashedPassword = hashDataSHA512(dto.hash);
  //   else hashedPassword = hashDataSHA512(dto.login);
  //   // const hashedPassword = await this.hashData(dto.login);
  //   const types: Types.ObjectId[] = [];

  //   for (let i = 0; i < dto.types.length; i++) {
  //     // console.log(dto.types[i]);
  //     try {
  //       types.push(new Types.ObjectId(dto.types[i]));
  //       //dto.advertisingSources[i] = new Types.ObjectId(dto.advertisingSources[i]);
  //     } catch (e) {
  //       // console.log(e);
  //       throw new BadRequestException(
  //         `types: include unknown type ${dto.types[i]}`,
  //       );
  //     }

  //     const candidate = await this.specialistTypeModel.findById(types[i]);
  //     if (!candidate)
  //       throw new BadRequestException(
  //         `types: include unknown type ${dto.types[i]}`,
  //       );
  //   }

  //   const user = await this.specialistModel.create({
  //     ...dto,
  //     hash: hashedPassword,
  //     types,
  //     roles: ['specialist'],
  //   });
  //   const newSpecialist = new this.specialistModel(user);
  //   newSpecialist.save();
  //   return newSpecialist._id;
  // }

  // async update(
  //   dto: SpecialistWithIdDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (!mongoose.Types.ObjectId.isValid(dto._id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.specialistModel.findById(dto._id).exec();
  //   // .select(
  //   //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
  //   // )
  //   // .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   console.log(dto);
  //   if (dto.hash) dto.hash = hashDataSHA512(dto.hash);
  //   this.specialistModel.findByIdAndUpdate(dto._id, dto).exec();
  //   return;
  // }

  // async changeStatus(
  //   dto: SpecialistChangeStatusDto,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (!mongoose.Types.ObjectId.isValid(dto._id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.specialistModel.findById(dto._id).exec();
  //   // .select(
  //   //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
  //   // )
  //   // .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   this.specialistModel.findByIdAndUpdate(dto._id, dto).exec();
  //   return;
  // }

  // async getPatientsById(dto: GetRepresentativesByIdDto): Promise<any> {
  //   //TODO проверка на принадлежность пациента
  //   if (!mongoose.Types.ObjectId.isValid(dto.id))
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.specialistModel
  //     .findById(dto.id)
  //     .select('-_id patients')
  //     .populate(
  //       'patients',
  //       'number name surname patronymic dateOfBirth gender address isActive note _id',
  //       this.patientModel,
  //       dto.isActive !== undefined
  //         ? {
  //             isActive: dto.isActive,
  //           }
  //         : {},
  //     )
  //     .exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   console.log(candidate);
  //   // candidate.advertisingSources.forEach(async function (value, index) {
  //   //   const id = this[index];
  //   //   const cand = await this.advertisingSourceModel
  //   //     .findById(id)
  //   //     .select('name _id isActive')
  //   //     .exec();

  //   //   if (cand && cand.isActive) {
  //   //     this[index] = { _id: cand._id, name: cand.name };
  //   //   }
  //   // }, candidate.advertisingSources);

  //   return candidate?.patients;
  // }

  // async addPatient(
  //   dto: AddPatientToRepresentative,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (
  //     !mongoose.Types.ObjectId.isValid(dto.patientId) ||
  //     !mongoose.Types.ObjectId.isValid(dto.representativeId)
  //   )
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.patientModel.findById(dto.patientId).exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   const count = await this.representativesModel
  //     .findByIdAndUpdate(dto.representativeId, {
  //       $addToSet: { patients: new mongoose.Types.ObjectId(dto.patientId) },
  //     })
  //     .exec();
  //   return;
  // }

  // async removePatient(
  //   dto: AddPatientToRepresentative,
  //   id: string,
  //   roles: string[],
  // ): Promise<object> {
  //   if (
  //     !mongoose.Types.ObjectId.isValid(dto.patientId) ||
  //     !mongoose.Types.ObjectId.isValid(dto.representativeId)
  //   )
  //     throw new BadRequestException('_id: not found');
  //   const candidate = await this.patientModel.findById(dto.patientId).exec();
  //   if (!candidate) throw new BadRequestException('_id: not found');
  //   await this.representativesModel
  //     .findByIdAndUpdate(dto.representativeId, {
  //       $pull: { patients: new mongoose.Types.ObjectId(dto.patientId) },
  //     })
  //     .exec();
  //   return;
  // }

  // async hashData(data: string) {
  //   return await bcrypt.hash(data, 12);
  // }
}
