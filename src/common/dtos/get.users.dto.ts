import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { toNumber, toSpecificSortOrderType, trim } from '../../common/helpers';

export class GetUsersDto {
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
  public surname = '';

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public name = '';

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public patronymic = '';

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public login = '';

  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public roles: string;
}
