import type { ZodBigInt } from 'zod';

import type { Schema } from '..';

export const createBigIntSchema = (_zodBigInt: ZodBigInt): Schema => ({
  type: 'schema',
  schema: {
    type: 'integer',
    format: 'int64',
  },
});
