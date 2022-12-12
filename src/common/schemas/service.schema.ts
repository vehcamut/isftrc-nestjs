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

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: 'User',
    default: [],
    required: true,
  })
  @ApiProperty({
    example: [
      new Types.ObjectId('632b153c077e63515d42348a'),
      new Types.ObjectId('632b15c163949a53b89addad'),
    ],
    description: 'Рекмоендованные специалисты / Recommended specialists',
  })
  specialistTypes: Types.ObjectId[];
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
