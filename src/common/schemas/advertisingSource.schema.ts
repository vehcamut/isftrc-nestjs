import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type AdvertisingSourceDocument = AdvertisingSource & Document;

@Schema({ timestamps: true })
export class AdvertisingSource {
  @Prop({ unique: true, required: true })
  @ApiProperty({
    example: 'Из газеты',
    description: 'Название / Name',
  })
  name: string;
}

export const AdvertisingSourcesSchema =
  SchemaFactory.createForClass(AdvertisingSource);
