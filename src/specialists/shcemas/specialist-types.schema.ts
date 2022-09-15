import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpecialistTypesDocument = SpecialistTypes & Document;

@Schema({ timestamps: true })
export class SpecialistTypes {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop()
  note?: string;
}

export const SpecialistTypesSchema =
  SchemaFactory.createForClass(SpecialistTypes);
