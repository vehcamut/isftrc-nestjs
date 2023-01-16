import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type SpecialistTypeDocument = SpecialistType & Document;

@Schema({ timestamps: true })
export class SpecialistType {
  @Prop({ unique: true, required: true })
  @ApiProperty({
    example: 'Педиатр',
    description: 'Название / Name',
  })
  name: string;

  // @Prop({ default: '' })
  // @ApiProperty({
  //   example: 'Очень важное примечание',
  //   description: 'Примечание / Note',
  // })
  // note?: string;

  @Prop({ required: true, default: true })
  @ApiProperty({
    example: true,
    description: 'Статус / Status',
  })
  isActive: boolean;
}

export const SpecialistTypeSchema =
  SchemaFactory.createForClass(SpecialistType);
