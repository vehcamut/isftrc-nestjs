import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AdvertisingSourceDto {
  @IsNotEmpty({ message: 'name: поле имя не должено быть пустым' })
  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = false;
}

export class AdvertisingSourceWithIdDto extends AdvertisingSourceDto {
  @IsString()
  _id: string;
}

export class AdverstingSourseBaseDto {
  name: string;
  _id: string;
}
