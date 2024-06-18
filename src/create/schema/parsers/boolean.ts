import type { ZodBoolean } from 'zod';

import type { Schema } from '../schema';

export const createBooleanSchema = (_zodBoolean: ZodBoolean): Schema => ({
  type: 'schema',
  schema: {
    type: 'boolean',
  },
});
