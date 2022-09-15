import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  toBoolean,
  toLowerCase,
  toNumber,
  trim,
  toDate,
  toSpecificSortOrderType,
} from '../../common/helpers';

export class SpecialistTypesQueryDto {
  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber()
  @IsOptional()
  public page = 1;

  @Transform(({ value }) => toNumber(value, { default: 1, min: 1 }))
  @IsNumber()
  @IsOptional()
  public limit = 0;

  @Transform(({ value }) => toSpecificSortOrderType(value))
  @IsOptional()
  public order = 0;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public sort: string;

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public filter = '';
}
