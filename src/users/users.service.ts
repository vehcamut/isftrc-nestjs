import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common/exceptions';
//import { GetUsersDto } from './dto/get.users.dto';
//import { IGetUserResponse } from './interfaces';
import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, SortOrder } from 'mongoose';
import { User, UserDocument } from 'src/common/schemas';
import { IGetUserResponse } from 'src/common/interfaces';
import {
  AddUserDto,
  GetProfileDto,
  GetUsersDto,
  UserDto,
} from 'src/common/dtos';
//import { User, UserDocument } from './schemas';
//import { UserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  async getProfile(
    // dto: GetProfileDto,
    id: string,
    roles: string[],
  ): Promise<any> {
    // if (!mongoose.Types.ObjectId.isValid(dto.id))
    //   throw new BadRequestException('некорректный id пользователя');
    // if (dto.id !== id)
    //   throw new BadRequestException('попытка получить другого пользователя');
    const user = await this.userModel
      .findById(id)
      .populate([
        {
          path: 'advertisingSources',
          model: 'AdvertisingSource',
        },
        {
          path: 'types',
          model: 'SpecialistType',
        },
      ])
      .select(
        'types advertisingSources surname name patronymic phoneNumbers dateOfBirth emails login isActive',
      )
      .exec();
    console.log(id, user);
    if (!user) throw new BadRequestException('пользователь не найден');
    // if (!user.roles.includes('specialist'))
    //   throw new BadRequestException('специалист не найден');
    if (!user.isActive)
      throw new BadRequestException('пользователь деактивирован');
    // console.log('users: ', dto.login);
    return user;
    // const query = this.userModel.find({
    //   $and: [
    //     { name: { $regex: `${dto.name}`, $options: 'i' } },
    //     { surname: { $regex: `${dto.surname}`, $options: 'i' } },
    //     { patronymic: { $regex: `${dto.patronymic}`, $options: 'i' } },
    //     { login: { $regex: `${dto.login}`, $options: 'i' } },
    //     //{ roles: { $regex: `${dto.roles}`, $options: 'i' } },
    //   ],
    // });

    // query
    //   .skip(dto.page * dto.limit)
    //   .limit(dto.limit)
    //   .select(
    //     'name surname patronymic phoneNumbers dateOfBirth emails login roles status _id',
    //   );
    // const data = await query.exec();
    // return { data, count };
  }

  async getUsers(dto: GetUsersDto): Promise<IGetUserResponse> {
    console.log('users: ', dto.login);
    const query = this.userModel.find({
      $and: [
        { name: { $regex: `${dto.name}`, $options: 'i' } },
        { surname: { $regex: `${dto.surname}`, $options: 'i' } },
        { patronymic: { $regex: `${dto.patronymic}`, $options: 'i' } },
        { login: { $regex: `${dto.login}`, $options: 'i' } },
        //{ roles: { $regex: `${dto.roles}`, $options: 'i' } },
      ],
    });
    const count = await this.userModel
      .find({
        $and: [
          { name: { $regex: `${dto.name}`, $options: 'i' } },
          { surname: { $regex: `${dto.surname}`, $options: 'i' } },
          { patronymic: { $regex: `${dto.patronymic}`, $options: 'i' } },
          { login: { $regex: `${dto.login}`, $options: 'i' } },
          //{ roles: { $regex: `${dto.roles}`, $options: 'i' } },
        ],
      })
      .count()
      .exec();
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'name surname patronymic phoneNumbers dateOfBirth emails login roles status _id',
      );
    const data = await query.exec();
    return { data, count };
  }

  async addUser(dto: AddUserDto, roles: string[]): Promise<object> {
    const login: string = dto.login;
    const candidate = await this.userModel.findOne({ login });
    if (candidate) throw new BadRequestException('login: must be unique');
    const hashedPassword = await this.hashData(dto.hash);
    if (
      !roles.includes('admin') &&
      (dto.roles.includes('admin') || dto.roles.includes('registrator'))
    )
      throw new ForbiddenException('Access Denied');
    //Убрать пароль? password
    console.log(dto);
    const user = await this.userModel.create({
      ...dto,
      hash: hashedPassword,
      /* name: dto.name,
      surname: dto.surname,
      patronymic: dto.patronymic,
      dateOfBirth: dto.dateOfBirth,
      login: dto.login,
      hash: hashedPassword,
      status: dto.status,
      //roles: dto.roles,
      roles: dto.phoneNumbers,*/
      //emails: ['fgfgf', 'fgfgffg'],
    });

    console.log(dto);

    const newUser = new this.userModel(user);
    //newUser.emails.push(...dto.emails);
    //console.log(dto);
    newUser.save();
    return { message: 'success' };
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }
}
