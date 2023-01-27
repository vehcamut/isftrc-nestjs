import { AppointmentWithIdDto } from './appointment.dto';
import {
  ServiceGroupWithIdDto,
  ServiceGroupWithTypesDto,
  ServiceWithIdDto,
} from './servise.dto';
import { IsBoolean, IsNumber } from 'class-validator';

export class CourseDto {
  @IsNumber()
  number: number;

  @IsBoolean()
  status: boolean;
}

export class CourseWithId extends CourseDto {
  _id: string;
}

export class getCoursesDto {
  patient: string;
}

export class CourseWithServicesDto extends CourseWithId {
  serviceGroups: ServiceGroupWithServisesDto[];
}

export class ServiceGroupWithServisesDto extends ServiceGroupWithIdDto {
  services: ServiceInCourseDto[];
}
export class ServiceInCourseDto {
  kind: string;
  _id: string;
  type: ServiceTypeWithoutGroupDto;
  status: boolean;
  result?: string;
  note?: string;
  appointment?: AppointmentWithIdDto | undefined;
  patient?: string;
}
export class ServiceTypeWithoutGroupDto {
  _id: string;
  name: string;
  price: number;
  specialistTypes: any[] = [];
  isActive?: boolean = true;
  time?: Date;
}

// export class ServiceDto {

// }

// export class ServiceWithIdDto extends ServiceDto {
//   _id: string;
// }

export class patientCourseDto {
  patient: string;
}
