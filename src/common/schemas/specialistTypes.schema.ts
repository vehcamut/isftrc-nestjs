import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpecialistTypeDocument = SpecialistType & Document;

@Schema({ timestamps: true })
export class SpecialistType {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop({ default: '' })
  note: string;
}

export const SpecialistTypeSchema =
  SchemaFactory.createForClass(SpecialistType);
