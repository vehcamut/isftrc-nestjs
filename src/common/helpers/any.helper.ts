interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

export function trim(value: string): string {
  return value.trim();
}

export function toDate(value: string): Date {
  // console.log(new Date(value));
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();

  return value === 'true' || value === '1' ? true : false;
}

export function toSpecificSortOrderType(value: string): number {
  value = value.toLowerCase();
  switch (value) {
    case 'desc':
    case '1':
    case 'descending':
    case 'descend':
      return -1;
    case 'asc':
    case '0':
    case 'ascending':
    case 'ascend':
    default:
      return 1;
  }
}

export function toNumber(value: string, opts: ToNumberOptions = {}): number {
  let newValue: number = Number.parseInt(value || String(opts.default), 10);

  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}

export function toPhoneNumber(value: string): string {
  return value
    .trim()
    .replaceAll('-', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll(' ', '')
    .slice(-10, 11);
}
