import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsNotEmpty({ message: 'Логин не должен быть пустым' })
  @IsString()
  login: string;

  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @IsString()
  password: string;
}
