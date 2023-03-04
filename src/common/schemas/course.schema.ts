import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourseDocument = Course & Document;
@Schema({ timestamps: true })
export class Course {
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
