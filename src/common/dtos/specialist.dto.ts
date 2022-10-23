import { Types } from 'mongoose';
import { UserBaseDto, UserDto } from './user.dto';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { SpecialistTypeDto } from '.';

export class SpecialistDto extends UserBaseDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'types: должна быть хотя бы одна специальность' })
  @IsString({ each: true })
  types: Types.ObjectId[];
}

export class AddSpecialistDto extends UserDto {
  @IsNotEmpty({ message: 'hash: поле пароль не должено быть пустым' })
  @IsString()
  hash: string;
}

export class UpdateSpecialistDto extends UserDto {
  @IsNotEmpty({ message: '_id: поле пароль не должено быть пустым' })
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  hash: string;
}
