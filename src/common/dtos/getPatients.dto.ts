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
// export class GetFreePatientsDto extends GetPatientsDto {
//   @IsString()
//   representaticeId: string;
// }

export class GetPatientsByIdDto {
  @IsString()
  id: string;
}