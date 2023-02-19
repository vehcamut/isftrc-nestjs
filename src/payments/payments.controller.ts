import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Body, Delete, Post, Req, UseGuards } from '@nestjs/common/decorators';
import { Response } from 'express';
import { Roles } from 'src/common/decorators';
import {
  GetAdvanceDto,
  GetServiseByIdDto,
  PaymentDto,
  RemoveServiceDto,
  PaymentInfoDto,
} from 'src/common/dtos';
import { PaymentsService } from './payments.service';
import { AtGuard } from 'src/common/guards';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //addPaintment
  @Post('add')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async add(@Req() request: Request | any, @Body() dto: PaymentDto) {
    return this.paymentsService.add(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Get('getAdvance')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async getService(
    @Req() request: Request | any,
    @Query() dto: GetAdvanceDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    const response = await this.paymentsService.getAdvance(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    return response;
  }

  @Delete('remove')
  @UseGuards(AtGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async removeService(
    @Req() request: Request | any,
    @Body() dto: RemoveServiceDto,
  ) {
    return this.paymentsService.remove(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
  }

  @Get('getById')
  @UseGuards(AtGuard)
  @Roles('admin', 'representative')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Req() request: Request | any,
    @Query() dto: GetServiseByIdDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PaymentInfoDto> {
    const response = await this.paymentsService.getById(
      dto,
      request.user?.sub,
      request.user?.roles,
    );
    return response;
  }
}
