import { Appointment } from './../schemas/appointment.schema';
import { GetRequestDto } from './getRequest.dto';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsDate,
} from 'class-validator';
import {
  toBoolean,
  toDate,
  toNumber,
  toSpecificSortOrderType,
  trim,
} from '../helpers';
import { Gender } from '../interfaces';

export class GetAppointmetnsDto {
  @IsString()
  specialistId: string;

  @Transform((value) => toDate(value.value))
  // @Type(() => Date)
  @IsDate()
  begDate?: Date;

  @Transform((value) => toDate(value.value))
  // @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsBoolean()
  @IsOptional()
  isFree?: string;
}

export class AppointmentDto {
  @IsNotEmpty({
    message: 'begDate: поле дата начала не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  begDate: Date;

  @IsNotEmpty({
    message: 'endDate: поле дата окончания не должно быть пустым',
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @IsOptional()
  @IsString()
  service?: string;

  @IsNotEmpty({
    message: 'specialist: поле специалист не должно быть пустым',
  })
  @IsString()
  specialist: string;
}

export class AppointmentWithIdDto extends AppointmentDto {
  @IsNotEmpty({
    message: '_id: поле id не должно быть пустым',
  })
  @IsString()
  _id: string;
}