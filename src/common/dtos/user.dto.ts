import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { toPhoneNumber } from '../helpers';

export class UserDto {
  @IsNotEmpty({ message: 'surname: поле фамилия не должено быть пустым' })
  @IsString()
  surname: string;

  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'patronymic: поле отчество не должено быть пустым' })
  @IsString()
  patronymic: string;

  //@Transform(({ value }) => toNumber(value, { default: 1, min: 0 }))
  @IsArray()
  @ArrayNotEmpty({ message: 'phoneNumbers: должен быть хотя бы один телефон' })
  @IsString({ each: true })
  @IsPhoneNumber('RU', { each: true })
  @Transform(
    ({ value }) => value.map((value: string) => toPhoneNumber(value)) /*{
      console.log(value);
      return value;
    } */ /*{return value.map((value: string) => toPhoneNumber(value))}*/,
  )
  phoneNumbers: string[];

  @IsNotEmpty({
    message: 'dateOfBirth: поле дата рождения не должено быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsArray()
  @ArrayNotEmpty({
    message: 'emails: должен быть хотя бы адрес электронной почты',
  })
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  emails: string[];

  @IsNotEmpty({ message: 'login: поле логин не должено быть пустым' })
  @IsString()
  login: string;

  @IsNotEmpty({ message: 'hash: поле пароль не должено быть пустым' })
  @IsString()
  hash: string;

  @IsNotEmpty({ message: 'roles: поле роль не должено быть пустым' })
  @IsArray()
  @IsString({ each: true })
  roles: string[];

  @IsBoolean()
  status: boolean;
}
