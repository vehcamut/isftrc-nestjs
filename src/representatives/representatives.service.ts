import { BadRequestException } from '@nestjs/common/exceptions';
import {
  User,
  Patient,
  PatientDocument,
  UserDocument,
  AdvertisingSource,
  AdvertisingSourceDocument,
} from '../common/schemas';
import {
  AddPatientToRepresentative,
  AddRepresentativeDto,
  GetRepresentativesByIdDto,
  GetRepresentativesDto,
  PatientChangeStatusDto,
  RepresentativeWithIdDto,
} from '../common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { hashDataSHA512 } from '../common/common';

@Injectable()
export class RepresentativesService {
  constructor(
    @InjectModel(User.name)
    private representativesModel: Model<UserDocument>,
    @InjectModel(AdvertisingSource.name)
    private advertisingSourceModel: Model<AdvertisingSourceDocument>,
    @InjectModel(Patient.name)
    private patientModel: Model<PatientDocument>,
  ) {}
  async get(dto: GetRepresentativesDto): Promise<any> {
    let patientId;
    if (dto.patientId) {
      if (!mongoose.Types.ObjectId.isValid(dto.patientId))
        throw new BadRequestException('Некорректный id пациента');
      const candidate = await this.patientModel.findById(dto.patientId).exec();
      if (!candidate) throw new BadRequestException('Пациент не найден');
      patientId = dto.patientId;
    }
    const findCond = {
      $and: [
        patientId
          ? {
              patients: {
                $not: { $elemMatch: { $in: [patientId] } },
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

  async getById(dto: GetRepresentativesByIdDto): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некорректный id представителя');
    const candidate = await this.representativesModel
      .findById(dto.id)
      .select(
        'name surname patronymic dateOfBirth gender address isActive phoneNumbers emails login _id advertisingSources',
      )
      .populate('advertisingSources', 'name _id', this.advertisingSourceModel, {
        isActive: true,
      })
      .exec();
    if (!candidate) throw new BadRequestException('Представитель не найден');
    return candidate;
  }

  async add(
    dto: AddRepresentativeDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const repres = await this.representativesModel
      .findOne({ login: dto.login })
      .exec();
    if (repres) throw new BadRequestException('Логин должен быть уникальным');
    let hashedPassword: string;
    if (dto.hash) hashedPassword = hashDataSHA512(dto.hash);
    else hashedPassword = hashDataSHA512(dto.login);

    const advertisingSources: Types.ObjectId[] = [];

    for (let i = 0; i < dto.advertisingSources.length; i++) {
      try {
        advertisingSources.push(new Types.ObjectId(dto.advertisingSources[i]));
      } catch (e) {
        throw new BadRequestException(
          `Некорректный id источника рекламы: ${dto.advertisingSources[i]}`,
        );
      }

      const candidate = await this.advertisingSourceModel.findById(
        advertisingSources[i],
      );
      if (!candidate)
        throw new BadRequestException(
          `Неизвестный тип источника рекламы: ${dto.advertisingSources[i]}`,
        );
    }

    const newRepresentative = new this.representativesModel({
      ...dto,
      hash: hashedPassword,
      advertisingSources,
    });
    newRepresentative.save();
    return newRepresentative._id;
  }

  async update(
    dto: RepresentativeWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    const isRepres = roles.find((r) => r === 'representative');
    if (isRepres) {
      if (id !== dto._id)
        throw new BadRequestException('Представитель не найден');
    }
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('Некорректный id представителя');
    const representative = await this.representativesModel
      .findById(dto._id)
      .exec();

    if (!representative)
      throw new BadRequestException('Представитель не найден');

    if (!representative.isActive)
      throw new BadRequestException('Представитель деактивирован');

    if (dto.hash) dto.hash = hashDataSHA512(dto.hash);
    this.representativesModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async changeStatus(
    dto: PatientChangeStatusDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('Некорректный id представителя');
    const candidate = await this.representativesModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('Представитель не найден');
    this.representativesModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async getPatientsById(dto: GetRepresentativesByIdDto): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(dto.id))
      throw new BadRequestException('Некорретный id представителя');
    const candidate = await this.representativesModel
      .findById(dto.id)
      .select('-_id patients')
      .populate(
        'patients',
        'number name surname patronymic dateOfBirth gender address isActive note _id',
        this.patientModel,
        dto.isActive !== undefined
          ? {
              isActive: dto.isActive,
            }
          : {},
      )
      .exec();
    if (!candidate) throw new BadRequestException('Представитель не найден');
    return candidate?.patients;
  }

  async addPatient(
    dto: AddPatientToRepresentative,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('Некорректный id пациента');
    if (!mongoose.Types.ObjectId.isValid(dto.representativeId))
      throw new BadRequestException('Некорректный id представителя');

    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('Пациент не найден');

    if (!patient.isActive)
      throw new BadRequestException('Пациент деактивирован');

    const representative = await this.representativesModel
      .findById(dto.representativeId)
      .exec();
    if (!representative)
      throw new BadRequestException('Представитель не найден');

    if (!representative.isActive)
      throw new BadRequestException('Представитель деактивирован');

    await this.representativesModel
      .findByIdAndUpdate(dto.representativeId, {
        $addToSet: { patients: patient._id },
      })
      .exec();
    return;
  }

  async removePatient(
    dto: AddPatientToRepresentative,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto.patientId))
      throw new BadRequestException('Некорректный id пациента');
    if (!mongoose.Types.ObjectId.isValid(dto.representativeId))
      throw new BadRequestException('Некорректный id представителя');

    const patient = await this.patientModel.findById(dto.patientId).exec();
    if (!patient) throw new BadRequestException('Пациент не найден');

    if (!patient.isActive)
      throw new BadRequestException('Пациент деактивирован');

    const representative = await this.representativesModel
      .findById(dto.representativeId)
      .exec();
    if (!representative)
      throw new BadRequestException('Представитель не найден');

    if (!representative.isActive)
      throw new BadRequestException('Представитель деактивирован');

    if (
      !representative.patients.find(
        (p) => p.toString() === patient._id.toString(),
      )
    )
      throw new BadRequestException('Пациент не связан с представителем');
    await this.representativesModel
      .findByIdAndUpdate(dto.representativeId, {
        $pull: { patients: new mongoose.Types.ObjectId(dto.patientId) },
      })
      .exec();
    return;
  }
}
