import { GetRequestDto } from './getRequest.dto';
import { Types } from 'mongoose';
import { SpecialistTypeDto } from '.';

import { AdvertisingSource } from './../schemas/advertisingSource.schema';
import { UserBaseDto, UserDto } from './user.dto';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { toBoolean, toPhoneNumber } from '../helpers';
import { Gender } from '../interfaces';
import { AdverstingSourseBaseDto } from './advertisingSource.dto';

export class AddSpecialistDto {
  @IsNotEmpty({ message: 'surname: поле фамилия не должено быть пустым' })
  @IsString()
  surname: string;

  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'patronymic: поле отчество не должено быть пустым' })
  @IsString()
  patronymic: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'phoneNumbers: должен быть хотя бы один телефон' })
  @IsString({ each: true })
  @IsPhoneNumber('RU', {
    each: true,
    message: 'Каждый номер должен быть действительным',
  })
  @Transform(({ value }) => value.map((value: string) => toPhoneNumber(value)))
  phoneNumbers: string[];

  @IsNotEmpty({
    message: 'dateOfBirth: поле дата рождения не должено быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsArray()
  @ArrayNotEmpty({
    message: 'emails: должен быть хотя бы один адрес электронной почты',
  })
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emails: string[];

  @IsNotEmpty({ message: 'login: поле логин не должено быть пустым' })
  @IsString()
  login: string;

  @IsNotEmpty({ message: 'gender: поле пол не должено быть пустым' })
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty({ message: 'address: поле адрес не должено быть пустым' })
  @IsString()
  address: string;

  @IsArray()
  @ArrayNotEmpty({
    message: 'specialistTypes: должна быть хотя бы одна специальность',
  })
  @IsString({ each: true })
  types: string[];

  @IsOptional()
  @IsString()
  hash?: string;
}
export class SpecialistWithIdDto extends AddSpecialistDto {
  @IsNotEmpty({ message: 'id: поле id не должено быть пустым' })
  @IsString()
  _id: string;
}
export class SpecialistDto extends UserBaseDto {
  @IsArray()
  @ArrayNotEmpty({
    message: 'specialistTypes: должна быть хотя бы одна специальность',
  })
  @IsString({ each: true })
  types: string[];
}
export class GetSpecificSpecialists {
  @IsNotEmpty({ message: 'type: поле тип не должено быть пустым' })
  @IsString()
  type: string;
}

export class SpecialistToSelectDto {
  _id: string;
  name: string;
}
export class GetSpecialistsDto extends GetRequestDto {
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
  types?: string;
}
export class GetSpecialistsByIdDto {
  @IsString()
  id: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SpecialistChangeStatusDto {
  @IsString()
  _id: string;

  @IsBoolean()
  isActive: boolean;
}
// export class SpecialistDto extends UserBaseDto {
//   @IsArray()
//   @ArrayNotEmpty({ message: 'types: должна быть хотя бы одна специальность' })
//   @IsString({ each: true })
//   types: Types.ObjectId[];
// }

// export class AddSpecialistDto extends UserDto {
//   @IsNotEmpty({ message: 'hash: поле пароль не должено быть пустым' })
//   @IsString()
//   hash: string;
// }

// export class UpdateSpecialistDto extends UserDto {
//   @IsNotEmpty({ message: '_id: поле пароль не должено быть пустым' })
//   @IsString()
//   _id: string;

//   @IsOptional()
//   @IsString()
//   hash: string;
// }
