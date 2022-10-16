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
  toSpecialistType,
} from '../helpers';
import { SpecialistTypeDto } from '.';

export class SpecialistTypesQueryDto {
  @Transform(({ value }) => toNumber(value, { default: 0, min: 0 }))
  @IsNumber()
  @IsOptional()
  public page = 1;

  @Transform(({ value }) => toNumber(value, { default: 1, min: 0 }))
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

  // @Transform(({ value }) => toSpecialistType(value))
  // // @IsString()
  // @IsOptional()
  // public filter = new SpecialistTypeDto();

  @Transform(({ value }) => trim(value))
  @IsOptional()
  public name = '';

  @Transform(({ value }) => trim(value))
  @IsOptional()
  public note = '';
}
