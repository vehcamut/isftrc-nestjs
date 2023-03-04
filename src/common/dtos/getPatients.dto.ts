import { GetRequestDto } from './getRequest.dto';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsNotEmpty,
} from 'class-validator';
import { toBoolean } from '../helpers';
import { Gender } from '../interfaces';

export class GetPatientsDto extends GetRequestDto {
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  id?: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  representativeId?: string;
}

export class GetPatientRepresentativesDto extends GetRequestDto {
  @IsNotEmpty({
    message: 'Поле id не должно быть пустым',
  })
  @IsString()
  id: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class GetPatientsByIdDto {
  @IsNotEmpty({
    message: 'Поле id не должно быть пустым',
  })
  @IsString()
  id: string;
}
