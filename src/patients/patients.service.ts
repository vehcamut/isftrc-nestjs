import { ServiceTypeWithIdDto } from './../common/dtos/servise.dto';
import { GetPatientsByIdDto } from './../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Appointment,
  AppointmentDocument,
  Course,
  CourseDocument,
  Patient,
  PatientDocument,
  Payment,
  PaymentDocument,
  Service,
  ServiceDocument,
  ServiceType,
  ServiceTypeDocument,
  User,
  UserDocument,
} from 'src/common/schemas';
import {
  AddServiceDto,
  RemoveServiceDto,
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
  patientCourseDto,
  CourseDto,
  CourseWithId,
  PatientCoursesInfo,
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
    @InjectModel(Appointment.name)
    private appointmentModel: Model<AppointmentDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
  ) {}
  async get(dto: GetPatientsDto, id: string, roles: string[]): Promise<any> {
    const isRepresentative = roles.find((r) => r === 'representative');
    let reparr = [];

    if (isRepresentative) {
      const representative = await this.representativesModel
        .findById(id)
        .exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      reparr = representative.patients;
    } else if (dto.representativeId) {
      if (!mongoose.Types.ObjectId.isValid(dto.representativeId))
        throw new BadRequestException('некорректный id представителя');
      const candidate = await this.representativesModel
        .findById(dto.representativeId)
        .select('-_id patients')
        .populate('patients', '_id', this.patientModel)
        .exec();
      if (!candidate) throw new BadRequestException('представитель не найден');
      reparr = candidate.patients;
    }
    const findCond = {
      $and: [
        isRepresentative
          ? {
              _id: { $in: reparr },
            }
          : {
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

  async getById(
    dto: GetPatientsByIdDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const isRepresentative = roles.find((r) => r === 'representative');
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('некорректный id пациента');
    let note = 'note ';
    if (isRepresentative) {
      const representative = await this.representativesModel
        .findById(id)
        .exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      if (!representative.patients.find((p) => p._id.toString() === dto.id))
        throw new BadRequestException('пациент не найден');
      note = '';
    }

    const patient = await this.patientModel
      .findById(dto.id)
      .select(
        `number name surname patronymic dateOfBirth gender address isActive ${note}representatives _id`,
      )
      .exec();
    if (!patient) throw new BadRequestException('пациент не найден');

    return patient;
  }

  async getPatientRepresentatives(
    dto: GetPatientRepresentativesDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const isRepresentative = roles.find((r) => r === 'representative');

    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('некорректный id пациента');

    if (isRepresentative) {
      const representative = await this.representativesModel
        .findById(id)
        .exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      if (!representative.patients.find((p) => p._id.toString() === dto.id))
        throw new BadRequestException('пациент не найден');
    }
    const patient = await this.patientModel.findById(dto.id).exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    // patientId = dto.id;
    // let patientId;
    // if (dto.id) {
    //   if (!mongoose.Types.ObjectId.isValid(dto.id))
    //     throw new BadRequestException('_id: not found');
    //   const candidate = await this.patientModel.findById(dto.id).exec();
    //   if (!candidate) throw new BadRequestException('_id: not found');
    //   patientId = dto.id;
    // }
    const findCond = {
      $and: [
        {
          patients: {
            $elemMatch: { $in: [dto.id] },
          },
        },
        // patientId
        //   ? {
        //       patients: {
        //         $elemMatch: { $in: [patientId] },
        //       },
        //     }
        //   : {},
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
  }

  async add(dto: PatientBaseDto, id: string, roles: string[]): Promise<object> {
    const isAdmin = roles.find((r) => r === 'admin');
    // создание нулевого курса (вне курсов который)
    const newCourse = new this.courseModel({
      number: 0,
      status: true,
    });
    newCourse.save();
    const count = await this.patientModel.find().count().exec();
    if (!isAdmin) {
      const representative = await this.representativesModel
        .findById(id)
        .exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      delete dto.note;
    }
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
      .exec();
    types.forEach((type) => {
      console.log(newCourse._id, type._id, newPatient._id);
      for (let i = 0; i < type.defaultAmountPatient; i++) {
        const srv = {
          course: newCourse._id,
          type: type._id,
          note: 'Данная услуга добавлена автоматически для нового пациента',
          patient: newPatient._id,
        };
        const newService = new this.serviceModel(srv);
        newService.save();
      }
    });
    if (!isAdmin) {
      await this.representativesModel
        .findByIdAndUpdate(id, {
          $addToSet: { patients: newPatient._id },
        })
        .exec();
    }
    return newPatient._id;
  }

  async update(
    dto: PatientWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isAdmin = roles.find((r) => r === 'admin');

    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('пациент не найден');
    const candidate = await this.patientModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('пациент не найден');
    if (!candidate.isActive)
      throw new BadRequestException('пациент деактивирован');
    delete dto.number;
    if (!isAdmin) {
      const representative = await this.representativesModel
        .findById(id)
        .exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      if (!representative.patients.find((p) => p._id.toString() === dto._id))
        throw new BadRequestException('пациент не найден');
      delete dto.note;
    }
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
  ): Promise<PatientCoursesInfo> {
    const isRepresentative = roles.find((r) => r === 'representative');

    let canBeClose = true;
    console.log(dto);
    if (!mongoose.Types.ObjectId.isValid(dto.patient))
      throw new BadRequestException('некорректный id пациента');
    const patient = await this.patientModel.findById(dto.patient).exec();
    if (!patient) throw new BadRequestException('Пациент не найден');

    if (isRepresentative) {
      const representative = await this.representativesModel
        .findById(id)
        .exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      console.log(representative);
      if (
        !representative.patients.find((p) => p._id.toString() === dto.patient)
      )
        throw new BadRequestException('пациент не найден');
    }
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
        total: 0,
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
      .select('_id status course type result note patient appointment number')
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
          select: {
            name: 1,
            group: 1,
            isActive: 1,
            price: 1,
            time: 1,
            _id: 1,
            // number: 1,
          },
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
    // .sort({ begDate: 1 });
    // console.log(result);
    result.forEach((serv: any) => {
      // console.log('serv ', serv);
      const nowCourse = res.find((c) => c._id == serv.course.toString());

      if (nowCourse.number == courses.length - 1 && !serv.status)
        canBeClose = false;

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
          total: 0,
          income: 0,
          outcome: 0,
        });
        nowGroup = nowCourse.serviceGroups[nowCourse.serviceGroups.length - 1];
      }
      const type = serv.type;
      // console.log(type);
      // type.group = undefined;
      // console.log('!!!!', type);

      if (nowGroup) {
        // const newServ = {
        //   appointment: appointment,
        //   _id: serv._id,
        //   status: serv.status,
        //   note: serv.note,
        //   result: serv.result,
        //   type: type,
        //   course: serv.course,
        //   number: serv.number,
        // };
        // delete newServ.type.group;
        if (serv.status) {
          nowGroup.total -= type.price;
          nowGroup.outcome += type.price;
          nowCourse.total -= type.price;
        }
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
          // number: serv.number,
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

    const payments = await this.paymentModel
      .find({
        course: {
          $in: patient.courses,
        },
      })
      .populate([
        {
          path: 'group',
          model: 'ServiceGroup',
          // select: {
          //   name: 1,
          //   isActive: 1,
          // },
        },
        {
          path: 'payer',
          model: 'User',
        },
      ]);
    // console.log(payments);
    payments.forEach((payment: any) => {
      // console.log('serv ', serv);
      const nowCourse = res.find((c) => c._id == payment.course.toString());

      let nowGroup;
      console.log(payment.group);
      if (!payment.group) {
        if (nowCourse.serviceGroups[0]._id != `${nowCourse._id}0`)
          nowCourse.serviceGroups.unshift({
            _id: `${nowCourse._id}0`,
            name: 'Оплаты вне групп',
            isActive: true,
            services: [],
            total: 0,
            income: 0,
            outcome: 0,
          });
        nowGroup = nowCourse.serviceGroups[0];
      } else {
        nowGroup = nowCourse.serviceGroups.find(
          (g) => g._id == payment.group._id.toString(),
        );

        if (!nowGroup) {
          nowCourse.serviceGroups.push({
            _id: payment.group._id,
            name: payment.group.name,
            isActive: payment.group.isActive,
            services: [],
            total: 0,
            income: 0,
            outcome: 0,
          });
          nowGroup =
            nowCourse.serviceGroups[nowCourse.serviceGroups.length - 1];
        }
      }

      if (nowGroup) {
        nowGroup.total += payment.amount;
        if (payment.amount > 0) nowGroup.income += payment.amount;
        else nowGroup.outcome -= payment.amount;
        nowCourse.total += payment.amount;
        nowGroup.services.push({
          _id: payment._id,
          status: true,
          note: '',
          result: '',
          kind: 'payment',
          name: payment.name,
          price: payment.amount < 0 ? payment.amount * -1 : undefined,
          cost: payment.amount >= 0 ? payment.amount : undefined,
          specialist: payment?.payer
            ? `${payment?.payer.surname} ${payment?.payer.name} ${payment?.payer.patronymic}`
            : undefined,
          date: payment?.date,
          // number: serv.number,
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

    res.forEach((c) =>
      c.serviceGroups.forEach((g) =>
        g.services.sort((s1, s2) => {
          if (!s1.date && !s2.date) return 0;
          if (s1.date && !s2.date) return -1;
          if (!s1.date && s2.date) return 1;
          return s1.date.getTime() - s2.date.getTime();
        }),
      ),
    );
    const lastCourse = res.find((c) => c.number == res.length - 1);
    if (lastCourse.total < 0 || !lastCourse.status) canBeClose = false;

    // console.log(res);
    return {
      courses: res,
      canBeClose,
      canBeOpen: !lastCourse.status && courses.length > 1,
      canBeNew: !lastCourse.status,
    };
    // 'name specialistTypes group isActive price time',

    // const candidate = await this.representativesModel
    //   .findById(dto.representativeId)
    //   .select('-_id patients')
    //   .populate('patients', '_id', this.patientModel)
    //   .exec();
    // reparr = patient.courses;
  }

  async newCourse(
    dto: patientCourseDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // поиск паиента и курсов
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('пациент не найден');
    const patient: any = await this.patientModel
      .findById(dto.patientId)
      .populate([
        {
          path: 'courses',
          model: 'Course',
        },
      ])
      .exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    if (!patient.isActive)
      throw new BadRequestException('пациент деактивирован');
    const courses: CourseDto[] = patient.courses;
    const lastCourse = courses[courses.length - 1];
    if (lastCourse.number != 0 && lastCourse.status == true)
      throw new BadRequestException(
        'курс не может быть открыт, пока не закрыт предыдущий',
      );
    const newCourse = new this.courseModel({
      number: courses.length,
      status: true,
    });
    newCourse.save();
    this.patientModel
      .findByIdAndUpdate(dto.patientId, {
        $push: {
          courses: newCourse._id,
        },
      })
      .exec();
    return;
  }

  async closeCourse(
    dto: patientCourseDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // поиск пациента и курсов
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('пациент не найден');
    const patient: any = await this.patientModel
      .findById(dto.patientId)
      .populate([
        {
          path: 'courses',
          model: 'Course',
        },
      ])
      .exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    if (!patient.isActive)
      throw new BadRequestException('пациент деактивирован');
    const courses: CourseWithId[] = patient.courses;
    const lastCourse = courses[courses.length - 1];
    if (lastCourse.number == 0)
      throw new BadRequestException('нулевой курс всегда открыт');
    if (lastCourse.status == false)
      throw new BadRequestException('курс уже закрыт');

    this.courseModel
      .findByIdAndUpdate(lastCourse._id, { status: false })
      .exec();

    let sum = 0;

    const service = await this.serviceModel
      .find({ course: lastCourse._id })
      .select('_id status course type result note patient appointment number')
      .populate([
        {
          path: 'type',
          model: 'ServiceType',
          select: {
            name: 1,
            group: 1,
            isActive: 1,
            price: 1,
            time: 1,
            _id: 1,
          },
        },
      ]);

    service.forEach((serv: any) => {
      if (!serv.status) throw new BadRequestException('есть незакрытые услуги');
      sum -= serv.type.price;
    });

    const payments = await this.paymentModel.find({
      course: lastCourse._id,
    });
    // console.log(payments);
    payments.forEach((payment: any) => {
      sum += payment.amount;
    });
    if (sum < 0) throw new BadRequestException('баланс курса отриательный');
    if (sum > 0) {
      const zeroCourse = courses[0];
      const newMinusPayment = new this.paymentModel({
        name: `Перевод лишних средств`,
        date: new Date(),
        amount: sum * -1,
        course: lastCourse._id,
      });
      await newMinusPayment.save();

      const newPlusPayment = new this.paymentModel({
        name: `Перевод средств с курса №${lastCourse.number}`,
        date: new Date(),
        amount: sum,
        course: zeroCourse._id,
        relatedPayment: newMinusPayment._id,
      });
      await newPlusPayment.save();

      this.paymentModel
        .findByIdAndUpdate(newMinusPayment._id, {
          relatedPayment: newPlusPayment._id,
        })
        .exec();
    }
    // console.log(res);
    return;
  }

  async openCourse(
    dto: patientCourseDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // поиск паиента и курсов
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('пациент не найден');
    const patient: any = await this.patientModel
      .findById(dto.patientId)
      .populate([
        {
          path: 'courses',
          model: 'Course',
        },
      ])
      .exec();
    if (!patient) throw new BadRequestException('пациент не найден');
    if (!patient.isActive)
      throw new BadRequestException('пациент деактивирован');
    const courses: CourseWithId[] = patient.courses;
    const lastCourse = courses[courses.length - 1];
    if (lastCourse.number == 0)
      throw new BadRequestException('нулевой курс всегда открыт');
    if (lastCourse.status == true)
      throw new BadRequestException('курс уже открыт');

    this.courseModel.findByIdAndUpdate(lastCourse._id, { status: true }).exec();

    return;
  }

  async addService(
    dto: AddServiceDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // поиск паиента и курсов
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
    if (!patient) throw new BadRequestException('пациент не найден');
    if (!patient.isActive)
      throw new BadRequestException('пациент деактивирован');
    if (!mongoose.Types.ObjectId.isValid(dto.type))
      throw new BadRequestException('тип услуги не найден');
    const serviceType: any = await this.serviceTypeModel
      .findById(dto.type)
      .populate([
        {
          path: 'group',
          model: 'ServiceGroup',
        },
      ])
      .exec();
    if (!serviceType || !serviceType.isActive || !serviceType.group.isActive)
      throw new BadRequestException('тип услуги не найден');

    const courses = patient.courses;
    const course = courses.find((course) =>
      dto.inCourse ? course.number === courses.length - 1 : course.number === 0,
    );
    const addedServices: string[] = [];
    for (let i = 0; i < dto.amount; i++) {
      const srv = {
        course: course._id,
        type: dto.type,
        note: dto.note,
        patient: dto.patient,
      };
      const newService = new this.serviceModel(srv);
      newService.save();
      addedServices.push(newService._id);
    }

    return addedServices;
  }

  async removeService(
    dto: RemoveServiceDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // поиск паиента и курсов
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('услуга не найдена');
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
        {
          path: 'patient',
          model: 'Patient',
        },
      ])
      .exec();
    if (!service) throw new BadRequestException('услуга не найдена');
    if (!service.patient.isActive)
      throw new BadRequestException('пациент деактивирован');
    if (!service.course.status)
      throw new BadRequestException('нельзя удалить услугу из закрытого курса');
    if (service.appointment) {
      this.appointmentModel
        .findByIdAndUpdate(service.appointment._id, {
          service: null,
        })
        .exec();
    }

    this.serviceModel.findByIdAndRemove(dto.id).exec();
    return;
  }
}
