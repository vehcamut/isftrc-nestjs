import { AppointmentWithIdDto } from './appointment.dto';
import { SpecialistTypeDto, SpecialistTypeWithIdDto } from 'src/common/dtos';
import { GetRequestDto } from './getRequest.dto';
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
import { toBoolean, toDate, trim } from '../helpers';
import { ToBoolean } from 'class-sanitizer';

export class GetServiceDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public filter = '';
}

export class GetTypesDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  public group: string;
}
export class ServiceGroupDto {
  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
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
  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'price: поле цена не должено быть пустым' })
  @IsNumber()
  price: number;

  @IsArray()
  // @IsOptional()
  @IsString({ each: true })
  specialistTypes: any[] = [];

  @IsNotEmpty({ message: 'group: поле группа не должено быть пустым' })
  @IsString()
  group: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsNotEmpty({ message: 'time: поле время не должено быть пустым' })
  @Transform((value) => toDate(value.value))
  // @Type(() => Date)
  @IsDate()
  time?: Date;

  // @IsNotEmpty({ message: 'price: поле цена не должено быть пустым' })
  @IsNumber()
  @IsOptional()
  defaultAmountPatient?: number = 0;
}

export class ServiceTypeWithIdDto extends ServiceTypeDto {
  @IsString()
  _id: string;
}

export class AddServiceDto {
  @IsNotEmpty({ message: 'type: поле тип услуги не должено быть пустым' })
  @IsString()
  type: string;

  @IsBoolean()
  inCourse: boolean;

  @IsOptional()
  @IsString()
  note?: string;

  @IsNotEmpty({ message: 'amount: поле количество не должено быть пустым' })
  @IsNumber()
  amount: number;

  @IsNotEmpty({ message: 'patient: поле пациент не должено быть пустым' })
  @IsString()
  patient: string;
}

export class RemoveServiceDto {
  id: string;
  // patient: string;
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
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public id = '';
}

export class AddAppointmentToServiceDto {
  @IsNotEmpty()
  @IsString()
  appointmentId: string;

  @IsNotEmpty()
  @IsString()
  serviceId?: string;
}

export class CloseServiceDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  result: string;
}
export class OpenServiceDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}
