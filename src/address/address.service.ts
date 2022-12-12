import { BadRequestException } from '@nestjs/common/exceptions';
import { Patient, PatientDocument } from 'src/common/schemas';
import { addressGetDto, GetRequestDto, PatientBaseDto } from 'src/common/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SortOrder } from 'mongoose';
import { HttpService } from '@nestjs/axios/dist';
import { map } from 'rxjs/operators';
@Injectable()
export class AddressService {
  constructor(private readonly httpService: HttpService) {}

  async getAddresses(dto: addressGetDto): Promise<any> {
    const url =
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
    const query = dto.query;
    const token = '2268576d8442ed5e6094acf0be5daed3f4718691';
    const data = this.httpService
      .post(url, JSON.stringify({ query: query }), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Token ' + token,
        },
      })
      .pipe(
        map((response) => {
          return response.data.suggestions.map((obj) => {
            return { value: obj.unrestricted_value };
          });
        }),
      );

    return data;
  }
}
