import { User, UserDocument } from './../user.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthDto } from './dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Tokens } from './types';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  hashData(data: string) {
    return bcrypt.hash(data, 12);
  }

  async signupLocal(dto: AuthDto): Promise<Tokens> {
    const email: string = dto.email;

    const candidate = await this.userModel.findOne({ email });
    if (candidate) {
      console.log('USER EST');
    } else {
      const hashedPassword = await this.hashData(dto.password);
      //Убрать пароль? password
      const user = await this.userModel.create({
        ...dto,
        hash: hashedPassword,
      });
      const newUser = new this.userModel(user);
      newUser.save();
    }
  }

  signipLocal() {}

  logout() {}

  refreshTokens() {}
}
