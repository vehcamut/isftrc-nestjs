import { GetRequestDto } from './getRequest.dto';
import { IsBoolean, IsNumber } from 'class-validator';
import { Exclude, Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { toBoolean } from '../helpers';

export class SpecialistTypeDto {
  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
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
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
