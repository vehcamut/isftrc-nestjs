import { IsString } from 'class-validator';

export class addressGetDto {
  @IsString({ message: 'Поле адреса не должно быть пустым' })
  query: string;
}
