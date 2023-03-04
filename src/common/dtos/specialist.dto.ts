import { GetRequestDto } from './getRequest.dto';
import { UserBaseDto } from './user.dto';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { toBoolean, toPhoneNumber } from '../helpers';
import { Gender } from '../interfaces';

export class AddSpecialistDto {
  @IsNotEmpty({ message: 'Поле фамилия не должно быть пустым' })
  @IsString()
  surname: string;

  @IsNotEmpty({ message: 'Поле имя не должно быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Поле отчество не должно быть пустым' })
  @IsString()
  patronymic: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Должен быть хотя бы один телефон' })
  @IsString({ each: true })
  @IsPhoneNumber('RU', {
    each: true,
    message: 'Каждый номер должен быть действительным',
  })
  @Transform(({ value }) => value.map((value: string) => toPhoneNumber(value)))
  phoneNumbers: string[];

  @IsNotEmpty({
    message: 'Поле дата рождения не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsArray()
  @ArrayNotEmpty({
    message: 'Должен быть хотя бы один адрес электронной почты',
  })
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emails: string[];

  @IsNotEmpty({ message: 'Поле логин не должно быть пустым' })
  @IsString()
  login: string;

  @IsNotEmpty({ message: 'Поле пол не должно быть пустым' })
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty({ message: 'Поле адрес не должно быть пустым' })
  @IsString()
  address: string;

  @IsArray()
  @ArrayNotEmpty({
    message: 'Должна быть хотя бы одна специальность',
  })
  @IsString({ each: true })
  types: string[];

  @IsOptional()
  @IsString()
  hash?: string;
}
export class SpecialistWithIdDto extends AddSpecialistDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @IsString()
  _id: string;
}
export class SpecialistDto extends UserBaseDto {
  @IsArray()
  @ArrayNotEmpty({
    message: 'Должна быть хотя бы одна специальность',
  })
  @IsString({ each: true })
  types: string[];
}
export class GetSpecificSpecialists {
  @IsNotEmpty({ message: 'Поле тип не должно быть пустым' })
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
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @IsString()
  id: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class SpecialistChangeStatusDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @IsString()
  _id: string;

  @IsBoolean()
  isActive: boolean;
}
