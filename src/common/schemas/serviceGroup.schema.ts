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

  @Prop({ required: true, default: true })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  isActive: boolean;
}
export const ServiceGroupSchema = SchemaFactory.createForClass(ServiceGroup);
