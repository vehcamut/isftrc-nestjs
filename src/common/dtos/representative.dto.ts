import { AdvertisingSource } from './../schemas/advertisingSource.schema';
import { UserBaseDto } from './user.dto';
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
import { AdverstingSourseBaseDto } from './advertisingSource.dto';

export class AddRepresentativeDto {
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
    message: 'advertisingSources: должен быть хотя бы один источник рекламы',
  })
  @IsString({ each: true })
  advertisingSources: string[];

  @IsOptional()
  @IsString()
  hash?: string;
}
export class RepresentativeWithIdDto extends AddRepresentativeDto {
  @IsNotEmpty({ message: 'surname: поле фамилия не должено быть пустым' })
  @IsString()
  _id: string;
}
export class representativeDto extends UserBaseDto {
  @IsString()
  advertisingSources: AdverstingSourseBaseDto;
}
