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
import { toPhoneNumber } from '../helpers';
import { Gender } from '../interfaces';

export class UserBaseDto {
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
  @IsPhoneNumber('RU', { each: true })
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsNotEmpty({ message: 'gender: поле пол не должено быть пустым' })
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty({ message: 'address: поле адрес не должено быть пустым' })
  @IsString()
  address: string;
}

export class AddBaseUserDto extends UserBaseDto {
  @IsOptional()
  @IsNotEmpty({ message: 'hash: поле пароль не должено быть пустым' })
  @IsString()
  hash?: string;
}
export class UserDto extends UserBaseDto {
  @IsNotEmpty({ message: 'roles: поле роль не должено быть пустым' })
  @IsArray()
  @IsString({ each: true })
  roles: string[];
}
export class AddUserDto extends UserDto {
  @IsNotEmpty({ message: 'hash: поле пароль не должено быть пустым' })
  @IsString()
  hash: string;
}

export class UpdateUserDto extends UserDto {
  @IsNotEmpty({ message: '_id: поле id не должено быть пустым' })
  @IsString()
  _id: string;

  @IsOptional()
  @IsString()
  hash: string;
}

export class GetProfileDto {
  @IsNotEmpty({ message: 'id: поле id не должено быть пустым' })
  @IsString()
  id: string;
}
