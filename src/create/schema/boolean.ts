import { oas31 } from 'openapi3-ts';
import { ZodBoolean } from 'zod';

export const createBooleanSchema = (
  _zodBoolean: ZodBoolean,
): oas31.SchemaObject => ({
  type: 'boolean',
});
