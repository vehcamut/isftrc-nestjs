import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JWTRefreshTokenDocument = JWTRefreshToken & Document;

@Schema({ timestamps: true })
export class JWTRefreshToken {
  @Prop({ unique: true })
  hash?: string;

  @Prop()
  userInfo?: string;
}

export const JWTRefreshTokenSchema =
  SchemaFactory.createForClass(JWTRefreshToken);
