import {
  EmailSchema,
  EmailDocument,
  PhoneNumberSchema,
  PhoneNumberDocument,
} from './../../common/schemas';
import {
  JWTRefreshTokenDocument,
  JWTRefreshTokenSchema,
} from './jwt-refresh-token.schema';
import { Get } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  // @Prop()
  // updatedAt: Date;

  @Prop()
  surname: string;

  @Prop()
  name: string;

  @Prop()
  patronymic: string;

  @Prop({ /*type: [PhoneNumberSchema],*/ default: [] })
  phoneNumbers: string[];

  @Prop()
  dateOfBirth: Date;

  @Prop({ /*type: [EmailSchema],*/ default: [] })
  emails: string[];

  @Prop({ unique: true })
  login: string;

  @Prop()
  hash: string;

  @Prop({ default: ['user'] })
  roles: string[];

  @Prop()
  status: boolean;

  @Prop({ type: [JWTRefreshTokenSchema], default: [] })
  rt: JWTRefreshTokenDocument[];
}

export const UserSchema = SchemaFactory.createForClass(User);
