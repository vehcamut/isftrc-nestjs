import { createHmac } from 'crypto';

export function hashDataSHA512(data: string) {
  return createHmac('sha512', process.env.secret).update(data).digest('hex');
}
