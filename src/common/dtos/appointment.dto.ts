import { SpecialistToSelectDto } from './specialist.dto';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import { toBoolean, toDate } from '../helpers';

export class GetAppointmetnsDto {
  @IsString()
  @IsNotEmpty({
    message: 'id специалиста не должен быть пустым',
  })
  specialistId: string;

  @Transform((value) => toDate(value.value))
  @IsDate()
  begDate?: Date;

  @Transform((value) => toDate(value.value))
  @IsDate()
  endDate?: Date;

  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  @IsOptional()
  isFree?: string;

  @Transform((value) => toDate(value.value))
  @IsDate()
  @IsOptional()
  time?: Date;
}

export class GetPatientAppointmetnsDto {
  @IsString()
  @IsNotEmpty({
    message: 'id пациента не должен быть пустым',
  })
  patientId: string;

  @Transform((value) => toDate(value.value))
  @IsDate()
  begDate?: Date;

  @Transform((value) => toDate(value.value))
  @IsDate()
  endDate?: Date;

  @Transform((value) => toDate(value.value))
  @IsDate()
  @IsOptional()
  time?: Date;
}

export class GetFreeAppointmetnsDto {
  @IsString()
  @IsNotEmpty({
    message: 'id специалиста не должен быть пустым',
  })
  specialistId: string;

  @IsString()
  patientId: string;

  @Transform((value) => toDate(value.value))
  @IsDate()
  begDate?: Date;

  @Transform((value) => toDate(value.value))
  @IsDate()
  endDate?: Date;

  @IsString()
  serviceId: string;
}
export class AppointmentDto {
  @IsNotEmpty({
    message: 'Поле дата начала не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  begDate: Date;

  @IsNotEmpty({
    message: 'Поле дата окончания не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsString()
  service?: string;

  @IsNotEmpty({
    message: 'Поле специалист не должно быть пустым',
  })
  @IsString()
  specialist: SpecialistToSelectDto;
}
export class AddAppointmentDto {
  @IsNotEmpty({
    message: 'Поле дата начала не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  begDate: Date;

  @IsNotEmpty({
    message: 'Поле продолжительность не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  time: Date;

  @IsNotEmpty({
    message: 'Поле специалист не должно быть пустым',
  })
  @IsString()
  specialist: string;

  @IsNotEmpty({
    message: 'Поле количество не должно быть пустым',
  })
  @IsNumber()
  amount: number;
}

export class AddedAppoitmentInfoDto {
  begDate: Date;
  endDate: Date;
}

export class AddAppointmentResultDto {
  amount: number;
  notAdded: AddedAppoitmentInfoDto[];
}

export class RemoveAppointmentDto {
  @IsNotEmpty({
    message: 'Поле id не должно быть пустым',
  })
  @IsString()
  _id: string;
}
export class AppointmentWithIdDto extends AppointmentDto {
  @IsNotEmpty({
    message: 'Поле id не должно быть пустым',
  })
  @IsString()
  _id: string;
}

export class GetAppointmetnsByIdDto {
  @IsString()
  id: string;
}
