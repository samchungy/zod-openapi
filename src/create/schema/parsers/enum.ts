import type { ZodEnum } from 'zod';

import type { Schema } from '..';

export const createEnumSchema = <T extends [string, ...string[]]>(
  zodEnum: ZodEnum<T>,
): Schema => ({
  type: 'schema',
  schema: {
    type: 'string',
    enum: zodEnum._def.values,
  },
});
