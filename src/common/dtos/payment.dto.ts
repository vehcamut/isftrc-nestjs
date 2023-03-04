import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { toDate, trim } from '../helpers';

export class PaymentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  groupId?: string;

  @IsNotEmpty({ message: 'В курсе не должно быть пустой' })
  @IsBoolean()
  inCourse: boolean;

  @IsNotEmpty({ message: 'Поле пациент не должно быть пустым' })
  @IsString()
  patient: string;

  @IsNotEmpty({ message: 'Сумма не должена быть пустой' })
  @IsNumber()
  amount: number;

  @IsNotEmpty({ message: 'Поле дата не должна быть пустой' })
  @Transform((value) => toDate(value.value))
  @IsDate()
  date: Date;

  @IsOptional()
  @IsString()
  payer?: string;

  @IsOptional()
  @IsBoolean()
  fromTheAdvance?: boolean;
}

export class GetAdvanceDto {
  @IsNotEmpty({
    message: 'Поле id пациента не должно быть пустым',
  })
  @Transform(({ value }) => trim(value))
  @IsString()
  public patient = '';
}

export class PaymentInfoDto {
  id: string;
  name?: string;
  group?: string;
  amount: number;
  date: Date;
  payer?: string;
  canRemove: boolean;
}
