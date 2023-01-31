import { ServiceTypeWithIdDto } from './../common/dtos/servise.dto';
import { GetPatientsByIdDto } from './../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Course,
  CourseDocument,
  Patient,
  PatientDocument,
  Service,
  ServiceDocument,
  ServiceType,
  ServiceTypeDocument,
  User,
  UserDocument,
} from 'src/common/schemas';
import {
  AddPatientToRepresentative,
  GetPatientRepresentativesDto,
  GetPatientsDto,
  CourseWithServicesDto,
  GetRepresentativesByIdDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  getCoursesDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';

@Injectable()
export class PatientsService {
  constructor(
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
    @InjectModel(User.name)
    private representativesModel: Model<UserDocument>,
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(Service.name)
    private serviceModel: Model<ServiceDocument>,
    @InjectModel(ServiceType.name)
    private serviceTypeModel: Model<ServiceTypeDocument>,
  ) {}
  async get(dto: GetPatientsDto): Promise<any> {
    let reparr = [];
    if (dto.representativeId) {
      if (!mongoose.Types.ObjectId.isValid(dto.representativeId))
        throw new BadRequestException('_id: not found');
      const candidate = await this.representativesModel
        .findById(dto.representativeId)
        .select('-_id patients')
        .populate('patients', '_id', this.patientModel)
        .exec();
      if (!candidate) throw new BadRequestException('_id: not found');
      reparr = candidate.patients;
    }
    console.log(reparr);
    const findCond = {
      $and: [
        {
          _id: { $nin: reparr },
        },
        {
          $or: [
            { name: { $regex: `${dto.filter}`, $options: 'i' } },
            { surname: { $regex: `${dto.filter}`, $options: 'i' } },
            { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
            { number: { $regex: `${dto.filter}` } },
            { address: { $regex: `${dto.filter}`, $options: 'i' } },
            { note: { $regex: `${dto.filter}`, $options: 'i' } },
          ],
        },
        dto.gender
          ? {
              gender: dto.gender,
            }
          : {},
        dto.isActive !== undefined
          ? {
              isActive: dto.isActive,
            }
          : {},
      ],
    };
    const query = this.patientModel.find(findCond);
    const count = await this.patientModel.find(findCond).count().exec();
    console.log(count);
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
      );
    const data = await query.exec();
    return { data, count };
  }

  async getById(dto: GetPatientsByIdDto): Promise<any> {
    //TODO проверка на принадлежность пациента
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.patientModel
      .findById(dto.id)
      .select(
        'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
      )
      .exec();
    if (!candidate) throw new BadRequestException('_id: not found');

    return candidate;
  }

  async getPatientRepresentatives(
    dto: GetPatientRepresentativesDto,
  ): Promise<any> {
    let patientId;
    if (dto.id) {
      if (!mongoose.Types.ObjectId.isValid(dto.id))
        throw new BadRequestException('_id: not found');
      const candidate = await this.patientModel.findById(dto.id).exec();
      if (!candidate) throw new BadRequestException('_id: not found');
      patientId = dto.id;
    }
    const findCond = {
      $and: [
        patientId
          ? {
              patients: {
                $elemMatch: { $in: [patientId] },
              },
            }
          : {},
        {
          $or: [
            { name: { $regex: `${dto.filter}`, $options: 'i' } },
            { surname: { $regex: `${dto.filter}`, $options: 'i' } },
            { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
            { phoneNumbers: { $regex: `${dto.filter}`, $options: 'i' } },
            { emails: { $regex: `${dto.filter}`, $options: 'i' } },
            { address: { $regex: `${dto.filter}`, $options: 'i' } },
            { login: { $regex: `${dto.filter}`, $options: 'i' } },
          ],
        },
        { roles: { $in: ['representative'] } },
        dto.gender
          ? {
              gender: dto.gender,
            }
          : {},
        dto.isActive !== undefined
          ? {
              isActive: dto.isActive,
            }
          : {},
      ],
    };
    const query = this.representativesModel.find(findCond);
    const count = await this.representativesModel.find(findCond).count().exec();
    console.log(count);
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'name surname patronymic dateOfBirth phoneNumbers emails gender address isActive advertisingSources _id login',
      );
    const data = await query.exec();
    return { data, count };

    //TODO проверка на принадлежность пациента
  }

  // async removeRepresentative(
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

  async add(dto: PatientBaseDto, id: string, roles: string[]): Promise<object> {
    // создание нулевого курса (вне курсов который)
    // const course = this.courseModel.create({
    //   number: 0,
    //   status: true,
    // });
    // const newCourse = new this.courseModel(course);
    // newCourse.save();
    const newCourse = new this.courseModel({
      number: 0,
      status: true,
    });
    newCourse.save();
    console.log(newCourse);
    const count = await this.patientModel.find().count().exec();
    console.log(dto);
    //TODO: Сделать проверку представителей
    // const user = await this.patientModel.create({
    //   ...dto,
    //   number: count + 1,
    //   courses: newCourse._id,
    // });
    // const newPatient = new this.patientModel(user);
    // newPatient.save();
    const newPatient = new this.patientModel({
      ...dto,
      number: count + 1,
      courses: newCourse._id,
    });
    newPatient.save();
    // добавление услуг по умолчанию
    const types = await this.serviceTypeModel
      .find({
        $and: [
          {
            defaultAmountPatient: { $gt: 0 },
          },
          {
            isActive: true,
          },
        ],
      })
      // .select('defaultAmountPatient _id isActive ')
      .exec();
    console.log(types);
    types.forEach((type) => {
      console.log(newCourse._id, type._id, newPatient._id);
      for (let i = 0; i < type.defaultAmountPatient; i++) {
        const srv = {
          course: newCourse._id,
          type: type._id,
          note: 'Данная услуга добавлена автоматически для нового пациента',
          patient: newPatient._id,
        };
        // const service = this.serviceModel.create(srv);
        // const newService = new this.serviceModel(service);
        // console.log(srv);
        // newService.save();
        const newService = new this.serviceModel(srv);
        newService.save();
      }
    });
    console.log(newPatient._id);
    return newPatient._id;
  }

  async update(
    dto: PatientWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.patientModel.findById(dto._id).exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    delete dto.number;
    console.log(dto);
    this.patientModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async changeStatus(
    dto: PatientChangeStatusDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('_id: not found');
    const candidate = await this.patientModel.findById(dto._id).exec();
    // .select(
    //   'number name surname patronymic dateOfBirth gender address isActive note representatives _id',
    // )
    // .exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    this.patientModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async getCourses(
    dto: getCoursesDto,
    id: string,
    roles: string[],
  ): Promise<any[]> {
    console.log(dto);
    if (!mongoose.Types.ObjectId.isValid(dto.patient))
      throw new BadRequestException('Пациент не найден');
    const patient = await this.patientModel.findById(dto.patient).exec();
    if (!patient) throw new BadRequestException('Пациент не найден');
    // курсы пациента

    const courses = await this.courseModel
      .find({
        _id: {
          $in: patient.courses,
        },
      })
      .select('_id number status');
    const res: CourseWithServicesDto[] = courses.map((v) => {
      return {
        _id: v._id,
        number: v.number,
        status: v.status,
        serviceGroups: [],
      } as CourseWithServicesDto;
    });
    // const res1 = await this.serviceModel.aggregate([
    //   {
    //     $match: {
    //       course: {
    //         $in: patient.courses,
    //       },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: '$type',
    //       // ii: { $push: { first: '$note' } },
    //       //note: { $first: '$note' },
    //       // to: { "$first": "$to" },
    //       // message: { "$first": "$message" },
    //       // date: { "$first": "$date" },
    //       // origId: { "$first": "$_id" }
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'ServiceType',
    //       localField: 'type',
    //       foreignField: '_id',
    //       as: 'type',
    //     },
    //   },
    //   { $unwind: { path: '$type' } },
    // ]);
    // console.log(res1);
    // console.log('!!!!!!!!!!!!!!!!1');
    const result = await this.serviceModel
      .find({
        course: {
          $in: patient.courses,
        },
      })
      .select('_id status course type result note patient appointment')
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
          select: { name: 1, group: 1, isActive: 1, price: 1, time: 1, _id: 1 },
          populate: {
            path: 'group',
            model: 'ServiceGroup',
            select: {
              name: 1,
              isActive: 1,
            },
            // transform(doc, id) {
            //   console.log(doc);
            //   return doc;
            // },
          },
        },
        {
          path: 'appointment',
          model: 'Appointment',
          select: {
            begDate: 1,
            // name: 1,
            specialist: 1,
          },
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
    // console.log(result);
    result.forEach((serv: any) => {
      console.log('serv ', serv);
      const nowCourse = res.find((c) => c._id == serv.course.toString());
      let nowGroup = nowCourse.serviceGroups.find(
        (g) => g._id == serv.type.group._id.toString(),
      );
      const appointment = serv.appointment;

      if (!nowGroup) {
        nowCourse.serviceGroups.push({
          _id: serv.type.group._id,
          name: serv.type.group.name,
          isActive: serv.type.group.isActive,
          services: [],
        });
        nowGroup = nowCourse.serviceGroups[nowCourse.serviceGroups.length - 1];
      }
      const type = serv.type;
      // console.log(type);
      // type.group = undefined;
      // console.log('!!!!', type);

      if (nowGroup) {
        const newServ = {
          appointment: appointment,
          _id: serv._id,
          status: serv.status,
          note: serv.note,
          result: serv.result,
          type: type,
          course: serv.course,
        };
        delete newServ.type.group;
        nowGroup.services.push({
          _id: serv._id,
          status: serv.status,
          note: serv.note,
          result: serv.result,
          kind: 'service',
          name: type.name,
          price: type.price,
          specialist: appointment?.specialist
            ? `${appointment?.specialist.surname} ${appointment?.specialist.name} ${appointment?.specialist.patronymic}`
            : undefined,
          date: appointment?.begDate,
          number: serv.number,
          // type: {
          //   _id: type._id,
          //   name: type.name,
          //   price: type.price,
          //   // specialistTypes: type.specialistTypes,
          //   isActive: type.isActive,
          //   time: type.time,
          // },
        });
      }
    });
    // console.log(res);
    return res;
    // 'name specialistTypes group isActive price time',

    // const candidate = await this.representativesModel
    //   .findById(dto.representativeId)
    //   .select('-_id patients')
    //   .populate('patients', '_id', this.patientModel)
    //   .exec();
    // reparr = patient.courses;
  }
}
