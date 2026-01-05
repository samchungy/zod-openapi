import type * as core from 'zod/v4/core';
import type { toJSONSchema } from 'zod/v4/core';

export const isAnyZodType = (schema: unknown): schema is core.$ZodTypes =>
  typeof schema === 'object' && schema !== null && '_zod' in schema;

export type OverrideParameters = Parameters<
  NonNullable<NonNullable<Parameters<typeof toJSONSchema>[1]>['override']>
>[0];

export type OverrideSchemaParameters = Omit<OverrideParameters, 'zodSchema'>;
