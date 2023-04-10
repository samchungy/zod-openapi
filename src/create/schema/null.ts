import { oas31 } from 'openapi3-ts';
import { ZodNull } from 'zod';

export const createNullSchema = (_zodNull: ZodNull): oas31.SchemaObject => ({
  type: 'null',
});
