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

  @Prop({ required: true })
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор / Unique identificator',
  })
  uid: number;
}
export const ServiceTypeSchema = SchemaFactory.createForClass(ServiceType);
