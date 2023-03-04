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
import { GetRequestDto } from './getRequest.dto';
import { Gender } from '../interfaces';
import { Transform, Type } from 'class-transformer';
import { toBoolean, toPhoneNumber } from '../helpers';

export class GetAdminsDto extends GetRequestDto {
  @IsEnum(Gender, { message: 'Неопознанный пол' })
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  id?: string;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean({ message: 'Неопознанное значение типа: boolean' })
  @IsOptional()
  isActive?: boolean;
}

export class AddAdminDto {
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
    message: 'Ддолжен быть хотя бы один адрес электронной почты',
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

  @IsOptional()
  @IsString()
  hash?: string;
}

export class AdminWithIdDto extends AddAdminDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @IsString()
  _id: string;
}

export class AdminChangeStatusDto {
  @IsString()
  _id: string;

  @IsBoolean()
  isActive: boolean;
}
