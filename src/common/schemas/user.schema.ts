import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender, IRepresentative, ISpecialist, IUser } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;
@Schema({ timestamps: true })
export class User implements IUser, ISpecialist, IRepresentative {
  @Prop({ required: true })
  @ApiProperty({
    example: 'Иванов',
    description: 'Фамилия / Surname',
  })
  surname: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'Иван',
    description: 'Имя / Name',
  })
  name: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'Иванович',
    description: 'Отчество / Patronymic',
  })
  patronymic: string;

  @Prop({ required: true, default: [] })
  @ApiProperty({
    default: [],
    example: ['9999999999', '9999999998'],
    description: 'Номера телефонов / Phone Numbers',
  })
  phoneNumbers: string[];

  @Prop({ required: true })
  @ApiProperty({
    type: Date,
    example: new Date('2005-12-30T00:00:00.000+00:00'),
    description: 'Дата рождения / Date of birth',
  })
  dateOfBirth: Date;

  @Prop({ required: true, enum: Gender })
  @ApiProperty({
    example: 'male',
    description: 'Пол / Gender',
  })
  gender: Gender;

  @Prop({ required: true, default: [] })
  @ApiProperty({
    example: ['first@example.com', 'second@example.com'],
    description: 'Адреса электронных почт / Emails',
  })
  emails: string[];

  @Prop({ unique: true, required: true })
  @ApiProperty({
    example: 'login',
    description: 'Логин / Login',
  })
  login: string;

  @Prop({ required: true })
  @ApiProperty({
    example: '$2b$12$XNgmYYC/x0/i9sSxBtqvzuMUIzPL1En/bFRj44.gxVO3njEf86gzW',
    description: 'Пароль / Password',
  })
  hash: string;

  @Prop({ required: true })
  @ApiProperty({
    example: 'г Астрахань, ул Татищева, д 20А',
    description: 'Адрес / Address',
  })
  address: string;

  @Prop({ required: true, default: ['representative'] })
  @ApiProperty({
    example: ['representative'],
    description: 'Роли / Roles',
  })
  roles: string[];

  @Prop({ required: true, default: true })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  isActive: boolean;

  @Prop({ default: [] })
  @ApiProperty({
    example: [
      '7fa3e488eec41e3be471dab6264e0e0cd26a2504702a5492802e27ab53cd06b0dd315abce626a9f9960d1e5f60885a07bcdaddcddf2538de7f6c482f20f8af3d',
    ],
    description: 'Хешы токенов обновления / Refresh token hashes',
  })
  rt: string[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'SpecialistType' })
  @ApiProperty({
    example: [
      new Types.ObjectId('632b153c077e63515d42348a'),
      new Types.ObjectId('632b15c163949a53b89addad'),
    ],
    description: 'Специальности / Specialties',
  })
  types?: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Patient' })
  @ApiProperty({
    example: [
      new Types.ObjectId('632b153c077e63115d32342a'),
      new Types.ObjectId('632b23c163949a53b89add12'),
    ],
    description: 'Представляемые лица / Represented persons',
  })
  patients?: Types.ObjectId[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'AdvertisingSource' })
  @ApiProperty({
    example: [
      new Types.ObjectId('632b153c077e63115d32342a'),
      new Types.ObjectId('632b23c163949a53b89add12'),
    ],
    description: 'Источники рекламы / Adversting Sources',
  })
  advertisingSources?: Types.ObjectId[];
}
export const UserSchema = SchemaFactory.createForClass(User);
