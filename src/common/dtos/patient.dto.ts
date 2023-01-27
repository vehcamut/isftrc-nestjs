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
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { toPhoneNumber } from '../helpers';
import { Gender } from '../interfaces';

export class PatientBaseDto {
  @IsNotEmpty({ message: 'surname: поле фамилия не должено быть пустым' })
  @IsString()
  surname: string;

  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'patronymic: поле отчество не должено быть пустым' })
  @IsString()
  patronymic: string;

  @IsNotEmpty({
    message: 'dateOfBirth: поле дата рождения не должено быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsNotEmpty({ message: 'gender: поле пол не должено быть пустым' })
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty({ message: 'address: поле адрес не должено быть пустым' })
  @IsString()
  address: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = false;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  represantatives?: string[] = [];

  @IsString()
  @IsOptional()
  note?: string;

  @IsString()
  @IsOptional()
  number?: number;
}
export class PatientWithIdDto extends PatientBaseDto {
  @IsString()
  _id: string;
}

export class AddPatientToRepresentative {
  @IsString()
  patientId: string;

  @IsString()
  representativeId: string;
}

export class PatientChangeStatusDto {
  @IsString()
  _id: string;

  @IsBoolean()
  isActive: boolean;
}
