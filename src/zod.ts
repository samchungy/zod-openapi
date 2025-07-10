import type * as core from 'zod/v4/core';

export const isAnyZodType = (schema: unknown): schema is core.$ZodTypes =>
  typeof schema === 'object' && schema !== null && '_zod' in schema;
