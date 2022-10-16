import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhoneNumberDocument = PhoneNumber & Document;

@Schema()
export class PhoneNumber {
  @Prop()
  number: number;

  // @Prop()
  // note: string;
}

export const PhoneNumberSchema = SchemaFactory.createForClass(PhoneNumber);
