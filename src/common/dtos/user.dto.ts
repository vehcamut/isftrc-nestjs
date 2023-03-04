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
import { toPhoneNumber } from '../helpers';
import { Gender } from '../interfaces';

export class UserBaseDto {
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
  @IsPhoneNumber('RU', { each: true })
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty({ message: 'Поле пол не должно быть пустым' })
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty({ message: 'Поле адрес не должно быть пустым' })
  @IsString()
  address: string;
}

export class AddBaseUserDto extends UserBaseDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Поле пароль не должно быть пустым' })
  @IsString()
  hash?: string;
}
export class UserDto extends UserBaseDto {
  @IsNotEmpty({ message: 'Поле роль не должно быть пустым' })
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
export class AddUserDto extends UserDto {
  @IsNotEmpty({ message: 'Поле пароль не должно быть пустым' })
  @IsString()
  hash: string;
}

export class UpdateUserDto extends UserDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  hash: string;
}

export class GetProfileDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @IsString()
  id: string;
}
