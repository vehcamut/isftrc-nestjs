import { SpecialistType } from '../../src/common/schemas';
import { trim } from '../../src/common/helpers/any.helper';

export function toSpecialistType(value: SpecialistType): SpecialistType {
  const filter: SpecialistType = {
    name: trim(value.name || ''),
    isActive: true,
    // note: trim(value.note || ''),
  };
  //filter.name ?

  return filter;
}
