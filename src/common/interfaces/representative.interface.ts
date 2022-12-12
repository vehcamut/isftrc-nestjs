import { IUser } from './';
import { Types } from 'mongoose';

export interface IRepresentative extends IUser {
  patients?: Types.ObjectId[];
  adverstingSources?: Types.ObjectId[];
}
