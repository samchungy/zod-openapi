import type { core } from 'zod/v4';

export const isAnyZodType = (schema: unknown): schema is core.$ZodTypes =>
  typeof schema === 'object' && schema !== null && '_zod' in schema;
