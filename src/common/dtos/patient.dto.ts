import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Gender } from '../interfaces';

export class PatientBaseDto {
  @IsNotEmpty({ message: 'Поле фамилия не должно быть пустым' })
  @IsString()
  surname: string;

  @IsNotEmpty({ message: 'Поле имя не должно быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Поле отчество не должно быть пустым' })
  @IsString()
  patronymic: string;

  @IsNotEmpty({
    message: 'Поле дата рождения не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsNotEmpty({ message: 'Поле пол не должно быть пустым' })
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty({ message: 'Поле адрес не должно быть пустым' })
  @IsString()
  address: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

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
  @IsNotEmpty({
    message: 'Поле id пациента не должно быть пустым',
  })
  @IsString()
  patientId: string;

  @IsNotEmpty({
    message: 'Поле id представителя не должно быть пустым',
  })
  @IsString()
  representativeId: string;
}

export class PatientChangeStatusDto {
  @IsNotEmpty({
    message: 'Поле id не должно быть пустым',
  })
  @IsString()
  _id: string;

  @IsNotEmpty({
    message: 'Поле активность не должно быть пустым',
  })
  @IsBoolean()
  isActive: boolean;
}
