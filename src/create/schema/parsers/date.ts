import type { ZodDate } from 'zod';

import type { Schema } from '..';

export const createDateSchema = (_zodDate: ZodDate): Schema => ({
  type: 'schema',
  schema: {
    type: 'string',
  },
});
