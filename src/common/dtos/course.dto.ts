import { AppointmentWithIdDto } from './appointment.dto';
import { ServiceGroupWithIdDto } from './servise.dto';
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

export class PatientCoursesInfo {
  courses: CourseWithServicesDto[];
  canBeClose: boolean;
  canBeOpen: boolean;
  canBeNew: boolean;
}
export class CourseWithServicesDto extends CourseWithId {
  serviceGroups: (ServiceGroupWithServisesDto | PaymentsWithoutGroup)[];
  total: number;
}

export class PaymentsWithoutGroup {
  _id: string;
  services: ServiceInCourseDto[];
  total: number;
  income: number;
  outcome: number;
}

export class ServiceGroupWithServisesDto extends ServiceGroupWithIdDto {
  services: ServiceInCourseDto[];
  total: number;
  income: number;
  outcome: number;
}
export class ServiceInCourseDto {
  kind: string;
  _id: string;
  name: string;
  price?: number;
  cost?: number;
  date: Date;
  number?: number;
  status: boolean;
  result?: string;
  note?: string;
  specialist?: string;
  appointment?: AppointmentWithIdDto | undefined;
  patient?: string;
}
export class ServiceTypeWithoutGroupDto {
  _id: string;
  name: string;
  price: number;
  isActive?: boolean = true;
  time?: Date;
}

export class patientCourseDto {
  patientId: string;
}
