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
}

export class AddAdminDto {
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

  @IsOptional()
  @IsString()
  hash?: string;
}

export class AdminWithIdDto extends AddAdminDto {
  @IsNotEmpty({ message: 'id: поле id не должно быть пустым' })
  @IsString()
  _id: string;
}

export class AdminChangeStatusDto {
  @IsString()
  _id: string;

  @IsBoolean()
  isActive: boolean;
}
