import type { ZodEnum } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

export const createEnumSchema = (
  zodEnum: ZodEnum<any>,
): oas31.SchemaObject => ({
  type: 'string',
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  enum: zodEnum._def.values,
});
