import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SpecialistSheduleDocument = SpecialistShedule & Document;

@Schema({ timestamps: true })
export class SpecialistShedule {
  @Prop()
  begin: Date;

  @Prop()
  end: Date;

  @Prop()
  note: string;
}

export const SpecialistSheduleSchema =
  SchemaFactory.createForClass(SpecialistShedule);
