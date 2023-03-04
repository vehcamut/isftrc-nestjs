import { GetRequestDto } from './getRequest.dto';
import { IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { toBoolean } from '../helpers';

export class SpecialistTypeDto {
  @IsNotEmpty({ message: 'Поле имя не должно быть пустым' })
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = false;
}
export class SpecialistTypeWithIdDto extends SpecialistTypeDto {
  @IsString()
  _id: string;
}
export class GetSpecialistTypeDto extends GetRequestDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
