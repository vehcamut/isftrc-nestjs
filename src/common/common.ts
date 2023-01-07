import { createHmac } from 'crypto';

export function hashDataSHA512(data: string) {
  return createHmac(
    'sha512',
    'sdfoj3n9f8nfpdsifo3ipfobids98fb328fbpdsfbisdf932ifpd-134@3423!',
  )
    .update(data)
    .digest('hex');
}
