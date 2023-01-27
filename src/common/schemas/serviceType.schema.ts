import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ServiceTypeDocument = ServiceType & Document;
@Schema({ timestamps: true })
export class ServiceType {
  @Prop({ required: true })
  @ApiProperty({
    example: 'Консультация',
    description: 'Название / Name',
  })
  name: string;

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: 'SpecialistType',
    default: [],
    required: true,
  })
  @ApiProperty({
    example: [
      new Types.ObjectId('632b153c077e63515d42348a'),
      new Types.ObjectId('632b15c163949a53b89addad'),
    ],
    description: 'Рекомендованные специальности / Recommended specialties',
  })
  specialistTypes: Types.ObjectId[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ServiceGroup', required: true })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Группа / Group',
  })
  group: Types.ObjectId;

  // @Prop({ required: true })
  // @ApiProperty({
  //   example: 1,
  //   description: 'Уникальный идентификатор / Unique identificator',
  // })
  // uid: number;

  @Prop({ required: true, default: true })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  isActive: boolean;

  @Prop({ require: true })
  @ApiProperty({
    example: '500',
    description: 'Цена / Price',
  })
  price: number;

  @Prop({ require: false, default: 0 })
  @ApiProperty({
    example: '0',
    description: 'Количество при добавлении пациента / Default amount patient',
  })
  defaultAmountPatient: number;

  @Prop({ required: true })
  @ApiProperty({
    type: Date,
    example: new Date('0000-00-00T00:15:00.000+00:00'),
    description: 'Время оказания / time',
  })
  time: Date;
}
export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);
