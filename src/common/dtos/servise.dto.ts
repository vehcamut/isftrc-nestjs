import { AppointmentWithIdDto } from './appointment.dto';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsDate,
} from 'class-validator';
import { toDate, trim } from '../helpers';

export class GetServiceDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public filter = '';
}

export class GetTypesDto {
  @IsNotEmpty({ message: 'Поле id группы не должно быть пустым' })
  @Transform(({ value }) => trim(value))
  @IsString()
  public group: string;
}
export class ServiceGroupDto {
  @IsNotEmpty({ message: 'Поле имя не должно быть пустым' })
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}

export class ServiceGroupWithIdDto extends ServiceGroupDto {
  @IsString()
  _id: string;
}

export class ServiceGroupWithTypesDto extends ServiceGroupWithIdDto {
  types: ServiceTypeWithIdDto[];
}

export class ServiceTypeDto {
  @IsNotEmpty({ message: 'Поле имя не должно быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Поле цена не должно быть пустым' })
  @IsNumber()
  price: number;

  @IsArray()
  @IsString({ each: true })
  specialistTypes: any[] = [];

  @IsNotEmpty({ message: 'Поле группа не должно быть пустым' })
  @IsString()
  group: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNotEmpty({ message: 'Поле время не должно быть пустым' })
  @Transform((value) => toDate(value.value))
  @IsDate()
  time?: Date;

  @IsNumber()
  @IsOptional()
  defaultAmountPatient?: number = 0;
}

export class ServiceTypeWithIdDto extends ServiceTypeDto {
  @IsString()
  _id: string;
}

export class AddServiceDto {
  @IsNotEmpty({ message: 'Поле тип услуги не должно быть пустым' })
  @IsString()
  type: string;

  @IsBoolean()
  inCourse: boolean;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty({ message: 'Поле количество не должно быть пустым' })
  @IsNumber()
  amount: number;

  @IsNotEmpty({ message: 'Поле пациент не должно быть пустым' })
  @IsString()
  patient: string;
}

export class RemoveServiceDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  id: string;
}

export class ServiceDto {
  canBeRemoved?: boolean;
  type: ServiceTypeWithIdDto;
  status: boolean;
  course: string;
  result?: string;
  note?: string;
  number?: number;
  appointment?: AppointmentWithIdDto | undefined;
  patient?: string;
}

export class ServiceInfoDto {
  canBeRemoved: boolean;
  id: string;
  type: string;
  status: boolean;
  course: string;
  result?: string;
  note?: string;
  number?: number;
  date?: Date;
  specialist?: string;
  patient: string;
}

export class ServiceWithIdDto extends ServiceDto {
  _id: string;
}

export class GetServiseByIdDto {
  @IsNotEmpty({ message: 'Поле id не должно быть пустым' })
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public id = '';
}

export class AddAppointmentToServiceDto {
  @IsOptional()
  @IsString()
  appointmentId?: string;

  @IsNotEmpty({ message: 'Поле id услуги не должно быть пустым' })
  @IsString()
  serviceId: string;
}

export class CloseServiceDto {
  @IsNotEmpty({ message: 'Поле id услуги не должно быть пустым' })
  @IsString()
  id: string;

  @IsNotEmpty({ message: 'Поле результат услуги не должно быть пустым' })
  @IsString()
  result: string;
}
export class OpenServiceDto {
  @IsNotEmpty({ message: 'Поле id услуги не должно быть пустым' })
  @IsString()
  id: string;
}

export class ChangeNoteDto {
  @IsNotEmpty({ message: 'Поле id услуги не должно быть пустым' })
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  note?: string;
}
