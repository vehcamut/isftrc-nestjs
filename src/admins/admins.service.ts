import { GetPatientsByIdDto } from '../common/dtos/getPatients.dto';
import { BadRequestException } from '@nestjs/common/exceptions';
import {
  User,
  Patient,
  PatientDocument,
  UserDocument,
  AdvertisingSource,
  AdvertisingSourceDocument,
} from 'src/common/schemas';
import * as bcrypt from 'bcrypt';
import {
  AddAdminDto,
  AddBaseUserDto,
  AddPatientToRepresentative,
  AddRepresentativeDto,
  AdminChangeStatusDto,
  AdminWithIdDto,
  GetAdminsDto,
  GetPatientsDto,
  GetRepresentativesByIdDto,
  GetRepresentativesDto,
  GetRequestDto,
  PatientBaseDto,
  PatientChangeStatusDto,
  PatientWithIdDto,
  RepresentativeWithIdDto,
} from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder, Types } from 'mongoose';
import { hashDataSHA512 } from '../common/common';

@Injectable()
export class AdminsService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  async get(dto: GetAdminsDto, id: string, roles: string[]): Promise<any> {
    const findCond = {
      $and: [
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
        { roles: { $in: ['admin'] } },
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
    const query = this.userModel.find(findCond);
    const count = await this.userModel.find(findCond).count().exec();
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'name surname patronymic dateOfBirth phoneNumbers emails gender address isActive _id login',
      );
    const data = await query.exec();
    return { data, count };
  }

  async getById(
    dto: GetRepresentativesByIdDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    const admin = await this.userModel
      .findById(dto.id)
      .select(
        'name surname patronymic dateOfBirth gender address isActive phoneNumbers emails login _id',
      )
      .exec();
    if (!admin) throw new BadRequestException('администратор не найден');
    return admin;
  }

  async add(dto: AddAdminDto, id: string, roles: string[]): Promise<object> {
    const loginBusy = await this.userModel.findOne({ login: dto.login }).exec();

    if (loginBusy)
      throw new BadRequestException('Логин должен быть уникальным');
    let hashedPassword: string;
    if (dto.hash) hashedPassword = hashDataSHA512(dto.hash);
    else hashedPassword = hashDataSHA512(dto.login);

    const newAdmin = new this.userModel({
      ...dto,
      hash: hashedPassword,
      roles: ['admin'],
    });
    newAdmin.save();
    return newAdmin._id;
  }

  async update(
    dto: AdminWithIdDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('не корректный id администратора');
    const admin = await this.userModel.findById(dto._id).exec();

    if (!admin) throw new BadRequestException('администратор не найден');

    if (!admin.isActive)
      throw new BadRequestException('администратор деактивирован');

    if (dto.hash) dto.hash = hashDataSHA512(dto.hash);
    console.log('!!!', dto);
    this.userModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }

  async changeStatus(
    dto: AdminChangeStatusDto,
    id: string,
    roles: string[],
  ): Promise<object> {
    if (!mongoose.Types.ObjectId.isValid(dto._id))
      throw new BadRequestException('не корректный id администратора');
    const admin = await this.userModel.findById(dto._id).exec();
    if (!admin) throw new BadRequestException('администратор не найден');
    this.userModel.findByIdAndUpdate(dto._id, dto).exec();
    return;
  }
}
