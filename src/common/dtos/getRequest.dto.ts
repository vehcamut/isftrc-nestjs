import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { toNumber, toSpecificSortOrderType, trim } from '../helpers';

export class GetRequestDto {
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

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public filter = '';
}
