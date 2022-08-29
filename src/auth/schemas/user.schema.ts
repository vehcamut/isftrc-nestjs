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
  @Prop()
  updatedAt: Date;

  @Prop({ unique: true })
  email: string;

  @Prop()
  hash: string;

  @Prop({ default: ['user'] })
  roles: string[];

  /*
  @Prop()
  hashedRt?: string;*/

  @Prop({ type: [JWTRefreshTokenSchema], default: [] })
  rt: JWTRefreshTokenDocument[];
}

export const UserSchema = SchemaFactory.createForClass(User);
