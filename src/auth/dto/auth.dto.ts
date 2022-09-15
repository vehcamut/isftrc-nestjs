import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty({ message: 'Логин не должен быть строкой' })
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
