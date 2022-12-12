import { UpdateSpecialistDto } from '../../src/common/dtos/specialist.dto';
import {
  SpecialistTypeRemoveDto,
  SpecialistTypeDto,
  SpecialistTypesQueryDto,
  SpecialistDto,
  GetRequestDto,
} from '../../src/common/dtos';
import {
  // Specialist,
  // SpecialistDocument,
  SpecialistType,
  SpecialistTypeDocument,
  User,
  UserDocument,
} from '../../src/common/schemas';
import * as bcrypt from 'bcrypt';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder, Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common/exceptions';
import { IGetResponse, ISpecialistTypesRes } from '../../src/common/interfaces';

@Injectable()
export class SpecialistsService {
  constructor(
    @InjectModel(SpecialistType.name)
    private SpecialistTypeModel: Model<SpecialistTypeDocument>,
    @InjectModel(User.name)
    private SpecialistModel: Model<UserDocument>,
  ) {}
  async addSpecialist(dto: SpecialistDto, roles: string[]): Promise<object> {
    const login: string = dto.login;
    console.log(dto);
    //if (!dto.roles.includes("specialist")) throw new BadRequestException('roles: must include unique');
    const candidate = await this.SpecialistModel.findOne({ login });
    if (candidate) throw new BadRequestException('login: must be unique');
    for (let i = 0; i < dto.types.length; i++) {
      try {
        dto.types[i] = new Types.ObjectId(dto.types[i]);
      } catch (e) {
        throw new BadRequestException(
          `types: include unknown type ${dto.types[i]}`,
        );
      }
      const candidate = await this.SpecialistTypeModel.findById(dto.types[i]);
      if (!candidate)
        throw new BadRequestException(
          `types: include unknown type ${dto.types[i]}`,
        );
    }

    // try {
    //   dto.types.forEach(async (value) => {
    //     value = new Types.ObjectId(value);
    //     console.log(value);
    //     const candidate = await this.SpecialistTypeModel.findById(value);
    //     if (!candidate)
    //       throw new BadRequestException(`types: include unknown type ${value}`);
    //   });
    // } catch (e) {
    //   throw new BadRequestException(`types: include unknown type ${'sds'}`);
    // }

    const hashedPassword = ''; //await this.hashData(dto.hash);
    // if (
    //   !roles.includes('admin') &&
    //   (dto.roles.includes('admin') || dto.roles.includes('registrator'))
    // )
    //   throw new ForbiddenException('Access Denied');
    //Убрать пароль? password
    console.log(dto);
    const user = await this.SpecialistModel.create({
      ...dto,
      hash: hashedPassword,
      roles: ['specialist'],
      /* name: dto.name,
      surname: dto.surname,
      patronymic: dto.patronymic,
      dateOfBirth: dto.dateOfBirth,
      login: dto.login,
      hash: hashedPassword,
      status: dto.status,
      //roles: dto.roles,
      roles: dto.phoneNumbers,*/
      //emails: ['fgfgf', 'fgfgffg'],
    });

    console.log(dto);

    const newUser = new this.SpecialistModel(user);
    //newUser.emails.push(...dto.emails);
    //console.log(dto);
    newUser.save();
    return { message: 'success' };
  }
  async getSpecialists(dto: GetRequestDto): Promise<IGetResponse<any>> {
    //console.log('users: ', dto.login);
    const query = this.SpecialistModel.find({
      $and: [
        { name: { $regex: `${dto.filter}`, $options: 'i' } },
        { surname: { $regex: `${dto.filter}`, $options: 'i' } },
        { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
        { login: { $regex: `${dto.filter}`, $options: 'i' } },
        { roles: 'specialist' },
        //{ roles: { $regex: `${dto.roles}`, $options: 'i' } },
      ],
    });
    const count = await this.SpecialistModel.find({
      $and: [
        { name: { $regex: `${dto.filter}`, $options: 'i' } },
        { surname: { $regex: `${dto.filter}`, $options: 'i' } },
        { patronymic: { $regex: `${dto.filter}`, $options: 'i' } },
        { login: { $regex: `${dto.filter}`, $options: 'i' } },
        { roles: 'specialist' },
        //{ roles: { $regex: `${dto.roles}`, $options: 'i' } },
      ],
    })
      .count()
      .exec();
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .populate({ path: 'types', select: 'note name' })
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select(
        'name surname patronymic phoneNumbers dateOfBirth emails login status types types _id',
      );
    const data = await query.exec();
    return { data, count };
  }
  async updateSpecialist(dto: UpdateSpecialistDto): Promise<object> {
    let candidate = await this.SpecialistModel.findById(dto._id).exec();
    if (!candidate) throw new BadRequestException('_id: not found');
    candidate = await this.SpecialistModel.findOne({
      login: dto.login,
    });
    console.log(candidate);
    if (candidate && candidate._id != dto._id)
      throw new BadRequestException('login: must be unique');
    delete dto.hash;
    this.SpecialistModel.findByIdAndUpdate(dto._id, {
      ...dto,
    }).exec();
    return { message: 'success' };

    // .find({
    //   name: { $regex: `${dto.filter}`, $options: 'i' },
    // });
    // if (dto.sort)
    //   query.sort({
    //     [dto.sort]: dto.order as SortOrder,
    //   });

    // query.skip((dto.page - 1) * dto.limit).select('name _id');
    // return query.exec() as Promise<SpecialistTypesDto[]>;
  }
  // async addSpecialisfgt(dto: SpecialistDto): Promise<object> {
  //   const candidate = await this.SpecialistModel.findOne({
  //     userId: dto.userId,
  //   });
  //   if (candidate) throw new BadRequestException('name: must be unique');
  //   const query = this.SpecialistTypeModel.create(dto);
  //   return { message: 'success' };
  // }
  async getSpecialistTypes(
    dto: SpecialistTypesQueryDto,
  ): Promise<ISpecialistTypesRes> {
    const query = this.SpecialistTypeModel.find({
      $or: [
        { name: { $regex: `${dto.name}`, $options: 'i' } },
        { note: { $regex: `${dto.note}`, $options: 'i' } },
      ],
    });
    const count = await this.SpecialistTypeModel.find({
      $or: [
        { name: { $regex: `${dto.name}`, $options: 'i' } },
        { note: { $regex: `${dto.note}`, $options: 'i' } },
      ],
    })
      .count()
      .exec();
    if (dto.sort)
      query.sort({
        [dto.sort]: dto.order as SortOrder,
      });

    query
      .skip(dto.page * dto.limit)
      .limit(dto.limit)
      .select('name note _id');
    const data = await query.exec();
    return { data, count };
  }
  async addSpecialistType(dto: SpecialistTypeDto): Promise<object> {
    const candidate = await this.SpecialistTypeModel.findOne({
      name: dto.name,
    });
    if (candidate) throw new BadRequestException('name: must be unique');
    const query = this.SpecialistTypeModel.create(dto);
    return { message: 'success' };

    // .find({
    //   name: { $regex: `${dto.filter}`, $options: 'i' },
    // });
    // if (dto.sort)
    //   query.sort({
    //     [dto.sort]: dto.order as SortOrder,
    //   });

    // query.skip((dto.page - 1) * dto.limit).select('name _id');
    // return query.exec() as Promise<SpecialistTypesDto[]>;
  }
  async editSpecialistType(dto: SpecialistTypeDto): Promise<object> {
    let candidate = await this.SpecialistTypeModel.findById(dto._id).exec();
    //  One({
    //   _id: dto._id,
    // });
    console.log(dto.name, dto.note, dto._id);
    if (!candidate) throw new BadRequestException('_id: not found');
    candidate = await this.SpecialistTypeModel.findOne({
      name: dto.name,
    });
    if (candidate && candidate._id != dto._id)
      throw new BadRequestException('name: must be unique');
    this.SpecialistTypeModel.findByIdAndUpdate(dto._id, {
      name: dto.name,
      note: dto.note,
    }).exec();
    return { message: 'success' };

    // .find({
    //   name: { $regex: `${dto.filter}`, $options: 'i' },
    // });
    // if (dto.sort)
    //   query.sort({
    //     [dto.sort]: dto.order as SortOrder,
    //   });

    // query.skip((dto.page - 1) * dto.limit).select('name _id');
    // return query.exec() as Promise<SpecialistTypesDto[]>;
  }
  async removeSpecialistType(dto: SpecialistTypeRemoveDto): Promise<string> {
    const candidate = await this.SpecialistTypeModel.findById(dto._id).exec();
    //  One({
    //   _id: dto._id,
    // });
    //console.log(dto.name, dto.note);
    if (!candidate) throw new BadRequestException('_id: not found');
    this.SpecialistTypeModel.findByIdAndDelete(dto._id).exec();
    return 'Success';

    // .find({
    //   name: { $regex: `${dto.filter}`, $options: 'i' },
    // });
    // if (dto.sort)
    //   query.sort({
    //     [dto.sort]: dto.order as SortOrder,
    //   });

    // query.skip((dto.page - 1) * dto.limit).select('name _id');
    // return query.exec() as Promise<SpecialistTypesDto[]>;
  }
  async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }
}
