import { GetRequestDto } from './getRequest.dto';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { toBoolean, toNumber, toSpecificSortOrderType, trim } from '../helpers';
import { Gender } from '../interfaces';

export class GetRepresentativesDto extends GetRequestDto {
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
  patientId?: string;
}
export class GetRepresentativesByIdDto {
  @IsString()
  id: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
