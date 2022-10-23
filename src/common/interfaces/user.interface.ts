import { JWTRefreshTokenDocument } from '../schemas/';
export interface IUser {
  surname: string;
  name: string;
  patronymic: string;
  phoneNumbers: string[];
  dateOfBirth: Date;
  emails: string[];
  login: string;
  hash: string;
  roles: string[];
  status: boolean;
  rt: JWTRefreshTokenDocument[];
}
