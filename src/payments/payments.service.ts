import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Service,
  ServiceDocument,
  ServiceGroup,
  ServiceGroupDocument,
  PatientDocument,
  Patient,
  UserDocument,
  User,
  PaymentDocument,
  Payment,
} from '../common/schemas';
import {
  GetServiseByIdDto,
  PaymentDto,
  GetAdvanceDto,
  RemoveServiceDto,
} from '../common/dtos';
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
    private serviceModel: Model<ServiceDocument>,
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
        const payer = await this.representativeModel
          .findOne({ _id: dto.payer, patients: patient._id })
          .exec();
        if (
          !payer ||
          !payer.isActive ||
          payer.roles.findIndex((r) => r === 'representative') == -1
        )
          throw new BadRequestException('представитель не найден');
        if (!payer.isActive)
          throw new BadRequestException('представитель деактивирован');
      }
      const newPayment = new this.paymentModel({
        name: dto.name,
        date: dto.date,
        amount: dto.amount,
        course: course._id,
        group: dto.groupId,
        payer: dto.payer,
      });
      newPayment.save();
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

    const minus = services.reduce(
      (sum, curentServ) => sum + curentServ.type.price,
      sum,
    );

    const plus = payments.reduce(
      (sum, curentServ) => sum + curentServ.amount,
      sum,
    );

    sum = plus - minus;
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
    const isRepresentative = roles.find((r) => r === 'representative');
    //todo проверка на принадлежность пациента
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('некорректный id оплаты');

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

    if (!payment) throw new BadRequestException('оплата не найдена');

    if (isRepresentative) {
      const representative = await this.representativeModel.findById(id).exec();
      if (!representative || !representative.isActive)
        throw new BadRequestException('представитель не найден');
      const patient = await this.patientModel
        .findOne({ courses: { $in: [payment.course._id] } })
        .exec();
      if (
        !representative.patients.find(
          (p) => p._id.toString() === patient._id.toString(),
        )
      )
        throw new BadRequestException('оплата не найдена');
    }

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
}
