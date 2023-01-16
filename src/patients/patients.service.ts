import { GetPatientsByIdDto } from './../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  Patient,
  PatientDocument,
  User,
  UserDocument,
} from 'src/common/schemas';
import {
  AddPatientToRepresentative,
  GetPatientRepresentativesDto,
  GetPatientsDto,
  GetRepresentativesByIdDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
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
    const count = await this.patientModel.find().count().exec();
    console.log(dto);
    //TODO: Сделать проверку представителей
    const user = await this.patientModel.create({
      ...dto,
      number: count + 1,
    });
    const newPatient = new this.patientModel(user);
    newPatient.save();
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
}
