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

export class GetServiceDto {
  @Transform(({ value }) => trim(value))
  @IsString()
  @IsOptional()
  public filter = '';
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
  type: string;
  course: string;
  note?: string;
  patient: string;
}

export class RemoveService {
  id: string;
  patient: string;
}

export class ServiceDto {
  type: ServiceTypeWithIdDto;
  status: boolean;
  course: string;
  result?: string;
  note?: string;
  appointment?: AppointmentWithIdDto | undefined;
  patient?: string;
}

export class ServiceWithIdDto extends ServiceDto {
  _id: string;
}
