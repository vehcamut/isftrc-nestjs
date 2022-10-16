import {
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common/exceptions';
//import { GetUsersDto } from './dto/get.users.dto';
//import { IGetUserResponse } from './interfaces';
import * as bcrypt from 'bcrypt';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { User, UserDocument } from 'src/common/schemas';
import { IGetUserResponse } from 'src/common/interfaces';
import { GetUsersDto, UserDto } from 'src/common/dtos';
//import { User, UserDocument } from './schemas';
//import { UserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  async getUsers(dto: GetUsersDto): Promise<IGetUserResponse> {
    //console.log('users: ', dto);
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

  async addUser(dto: UserDto, roles: string[]): Promise<object> {
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
