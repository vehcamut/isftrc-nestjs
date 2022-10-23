import { UserDto } from '../dtos';

export interface IGetResponse<Type> {
  count: number;
  data: Type[];
}
