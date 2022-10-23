import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

//export type SpecialistDocument = Specialist & Document;

//@Schema({ timestamps: true })
@Schema()
export class Specialist {
  @Prop({ type: SchemaTypes.ObjectId })
  types?: Types.ObjectId[];

  // @Prop({ required: true, type: SchemaTypes.ObjectId })
  // userId?: Types.ObjectId;

  // @Prop({ default: '' })
  // organizationName: string;

  // @Prop({ default: '' })
  // notes?: string[];

  // @Prop({ type: [SpecialistShedule], default: [] })
  // shedule: SpecialistSheduleDocument[];
}

//export const SpecialistSchema = SchemaFactory.createForClass(Specialist);
