import { SpecialistType } from './../../specialists/shcemas';
import { trim } from './any.helper';

export function toSpecialistType(value: SpecialistType): SpecialistType {
  const filter: SpecialistType = {
    name: trim(value.name || ''),
    note: trim(value.note || ''),
  };
  //filter.name ?

  return filter;
}
