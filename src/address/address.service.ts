import { InternalServerErrorException } from '@nestjs/common/exceptions';
import { addressGetDto } from '../common/dtos';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios/dist';
import { catchError, map } from 'rxjs/operators';
@Injectable()
export class AddressService {
  constructor(private readonly httpService: HttpService) {}

  async getAddresses(dto: addressGetDto): Promise<any> {
    const url =
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
    const query = dto.query;
    const token = process.env.DADATA_TOKEN;
    const data = this.httpService
      .post(url, JSON.stringify({ query: query }), {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: 'Token ' + token,
        },
      })
      .pipe(
        catchError((e) => {
          throw new InternalServerErrorException('Ошибка сервера');
        }),
        map((response) => {
          return response.data.suggestions.map((obj) => {
            return { value: obj.unrestricted_value };
          });
        }),
      );

    return data;
  }
}
