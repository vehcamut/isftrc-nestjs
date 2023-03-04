import { UserBaseDto } from './user.dto';
import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
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
import { AdverstingSourseBaseDto } from './advertisingSource.dto';

export class AddRepresentativeDto {
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
    message: 'Должен быть хотя бы один источник рекламы',
  })
  @IsString({ each: true })
  advertisingSources: string[];

  @IsOptional()
  @IsString()
  hash?: string;
}
export class RepresentativeWithIdDto extends AddRepresentativeDto {
  @IsNotEmpty({ message: 'Поле фамилия не должно быть пустым' })
  @IsString()
  _id: string;
}
export class representativeDto extends UserBaseDto {
  @IsString()
  advertisingSources: AdverstingSourseBaseDto;
}
