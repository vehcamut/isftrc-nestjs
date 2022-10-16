import { UserDto } from '../dtos';

export interface IGetUserResponse {
  count: number;
  data: UserDto[];
}
