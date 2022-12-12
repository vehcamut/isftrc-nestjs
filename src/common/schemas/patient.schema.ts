import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender, IPatient } from '../interfaces';
import { ApiProperty } from '@nestjs/swagger';

export type PatientDocument = Patient & Document;
@Schema({ timestamps: true })
export class Patient implements IPatient {
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

  @Prop({ required: true })
  @ApiProperty({
    example: 'г Астрахань, ул Татищева, д 20А',
    description: 'Адрес / Address',
  })
  address: string;

  @Prop({ required: true, default: false })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  isActive: boolean;

  @Prop({ unique: true, require: true })
  @ApiProperty({
    example: '4899',
    description: 'Номер / Number',
  })
  number: string;

  @Prop({ default: '' })
  @ApiProperty({
    example: 'Комментарий к карте пациента. Сюда можно добавить диагноз.',
    description: 'Комментарий / Note',
  })
  note: string;
}
export const PatientSchema = SchemaFactory.createForClass(Patient);
