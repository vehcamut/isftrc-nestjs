import { SchemaTypes, Types } from 'mongoose';
import { Specialist } from './specialist.schema';
import {
  EmailSchema,
  EmailDocument,
  PhoneNumberSchema,
  PhoneNumberDocument,
} from './../../common/schemas';
import {
  JWTRefreshTokenDocument,
  JWTRefreshTokenSchema,
} from './jwtRefreshToken.schema';
import { Get } from '@nestjs/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ISpecialist, IUser } from '../interfaces';

export type UserDocument = User & Document;
// @Schema()
// // export class Specialist {
// //   @Prop({ type: SchemaTypes.ObjectId })
// //   types?: Types.ObjectId[];
// // }

// @Schema()
// export class UserBase {
//   @Prop()
//   surname: string;

//   @Prop()
//   name: string;

//   @Prop()
//   patronymic: string;

//   @Prop({ /*type: [PhoneNumberSchema],*/ default: [] })
//   phoneNumbers: string[]; //PhoneNumberDocument[];

//   @Prop()
//   dateOfBirth: Date;

//   @Prop({ /*type: [EmailSchema],*/ default: [''] })
//   emails: string[]; // EmailDocument[];

//   @Prop({ unique: true })
//   login: string;

//   @Prop()
//   hash: string;

//   @Prop({ default: ['user'] })
//   roles: string[];

//   @Prop({ default: true })
//   status: boolean;

//   @Prop({ type: [JWTRefreshTokenSchema], default: [] })
//   rt: JWTRefreshTokenDocument[];
// }
//export interface User extends UserBase, Specialist {}
@Schema({ timestamps: true })
export class User implements IUser, ISpecialist {
  @Prop()
  surname: string;

  @Prop()
  name: string;

  @Prop()
  patronymic: string;

  @Prop({ /*type: [PhoneNumberSchema],*/ default: [] })
  phoneNumbers: string[]; //PhoneNumberDocument[];

  @Prop()
  dateOfBirth: Date;

  @Prop({ /*type: [EmailSchema],*/ default: [''] })
  emails: string[]; // EmailDocument[];

  @Prop({ unique: true })
  login: string;

  @Prop()
  hash: string;

  @Prop({ default: ['user'] })
  roles: string[];

  @Prop({ default: true })
  status: boolean;

  @Prop({ type: [JWTRefreshTokenSchema], default: [] })
  rt: JWTRefreshTokenDocument[];

  @Prop({ type: [SchemaTypes.ObjectId], ref: 'SpecialistType' })
  types?: Types.ObjectId[];
}
export const UserSchema = SchemaFactory.createForClass(User);
console.log(UserSchema);
