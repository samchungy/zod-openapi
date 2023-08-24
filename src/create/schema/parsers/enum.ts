import type { ZodEnum } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';

export const createEnumSchema = <T extends [string, ...string[]]>(
  zodEnum: ZodEnum<T>,
): oas31.SchemaObject => ({
  type: 'string',
  enum: zodEnum._def.values,
});
