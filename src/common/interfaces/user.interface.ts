import { IPerson } from './';

export interface IUser extends IPerson {
  login: string;
  hash: string;
  phoneNumbers: string[];
  emails: string[];
  roles: string[];
  isActive: boolean;
  rt: string[];
}
