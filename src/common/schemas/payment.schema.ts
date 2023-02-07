import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  @ApiProperty({
    example: 'Наличный расчет',
    description: 'Тип оплаты / Type of Payment',
  })
  name: string;

  @Prop({ required: true })
  @ApiProperty({
    type: Date,
    example: new Date('2005-12-30T00:00:00.000+00:00'),
    description: 'Дата оплаты / Date of payment',
  })
  date: Date;

  @Prop({ required: true })
  @ApiProperty({
    example: '1000',
    description: 'Сумма оплаты / Payment amount',
  })
  amount: number;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Course' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Курс / Course',
  })
  course: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ServiceGroup' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Группа / Group',
  })
  group?: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Плвтельщик / Payer',
  })
  payer?: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
