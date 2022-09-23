/*export interface SpecialistTypesDto {
  name: string;
  note: string;
}*/
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SpecialistTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsString()
  @IsOptional()
  _id: string;
}
