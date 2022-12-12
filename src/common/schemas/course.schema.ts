import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourseDocument = Course & Document;
@Schema({ timestamps: true })
export class Course {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Patient', required: true })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63115d32342a'),
    description: 'Пациент / Patient',
  })
  patient: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  @ApiProperty({
    example: 0,
    description: 'Номер / Number',
  })
  number: number;

  @Prop({ required: true, default: true })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  status: boolean;
}
export const CourseSchema = SchemaFactory.createForClass(Course);
