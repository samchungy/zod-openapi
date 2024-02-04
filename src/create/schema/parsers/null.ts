import type { ZodNull } from 'zod';

import type { Schema } from '..';

export const createNullSchema = (_zodNull: ZodNull): Schema => ({
  type: 'schema',
  schema: {
    type: 'null',
  },
});
