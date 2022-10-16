import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { SpecialistTypeDto } from '.';

export class SpecialistDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'types: должна быть хотя бы одна специальность' })
  @IsString({ each: true })
  types: string[];

  @IsNotEmpty({ message: 'userId: id пользователя не может быть пустым' })
  @IsString({ each: true })
  userId: string;

  @IsArray()
  @IsString({ each: true })
  notes: string[];
}
