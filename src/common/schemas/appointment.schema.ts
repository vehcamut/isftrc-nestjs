import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, SchemaTypes, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ required: true })
  @ApiProperty({
    type: Date,
    example: new Date('2005-12-30T00:00:00.000+00:00'),
    description: 'Дата / Date',
  })
  date: Date;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Service' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Услуга / Service',
  })
  service?: Types.ObjectId;

  @Prop({ required: true, type: SchemaTypes.ObjectId, ref: 'Specialist' })
  @ApiProperty({
    example: new Types.ObjectId('632b153c077e63515d42348a'),
    description: 'Специалист / Specialist',
  })
  specialist: Types.ObjectId;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
