import { IPerson } from '.';
export interface IPatient extends IPerson {
  number: string;
  isActive: boolean;
  note: string;
}

export enum Gender {
  Male = 'мужской',
  Female = 'женский',
}
