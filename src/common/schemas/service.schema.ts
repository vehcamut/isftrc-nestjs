import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true })
export class Service {
  @Prop({ required: true, default: false })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  status: boolean;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Course' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Курс / Course',
  })
  course: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'ServiceType' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Тип / Type',
  })
  type: Types.ObjectId;

  @Prop()
  @ApiProperty({
    example: 'Результат оказания услуги',
    description: 'Результат / Result',
  })
  result?: string;

  @Prop()
  @ApiProperty({
    example: 'Примечание к услуге',
    description: 'Примечание к услуге / Note',
  })
  note?: string;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Patient' })
  @ApiProperty({
    example: [
      new Types.ObjectId('632b153c077e63115d32342a'),
      new Types.ObjectId('632b23c163949a53b89add12'),
    ],
    description: 'Пациент / Patient',
  })
  patient: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Appointment' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Встреча / Appointment',
  })
  appointment?: Types.ObjectId;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
