import { IUser } from './';
import { Types } from 'mongoose';

export interface ISpecialist extends IUser {
  types?: Types.ObjectId[];
}
