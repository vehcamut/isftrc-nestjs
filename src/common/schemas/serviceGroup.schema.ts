import { SchemaTypes, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ServiceGroupDocument = ServiceGroup & Document;
@Schema({ timestamps: true })
export class ServiceGroup {
  @Prop({ required: true })
  @ApiProperty({
    example: 'Консультации',
    description: 'Название / Name',
  })
  name: string;

  @Prop({ unique: true, required: true })
  @ApiProperty({
    example: 1,
    description: 'Уникальный идентификатор / Unique identificator',
  })
  uid: number;
}
export const ServiceGroupSchema = SchemaFactory.createForClass(ServiceGroup);
