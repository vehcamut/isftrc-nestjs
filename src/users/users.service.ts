import { BadRequestException } from '@nestjs/common/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../common/schemas';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}
  async getProfile(id: string, roles: string[]): Promise<any> {
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
        'types advertisingSources surname name patronymic phoneNumbers dateOfBirth emails login isActive address gender',
      )
      .exec();
    if (!user) throw new BadRequestException('Пользователь не найден');

    if (!user.isActive)
      throw new BadRequestException('Пользователь деактивирован');

    return user;
  }
}
