import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop({ unique: true })
  email: string;

  @Prop()
  hash: string;

  @Prop()
  hashedRt?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
