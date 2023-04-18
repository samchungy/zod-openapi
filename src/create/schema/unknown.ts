import { oas31 } from 'openapi3-ts';
import { ZodUnknown } from 'zod';

export const createUnknownSchema = (
  _zodUnknown: ZodUnknown,
): oas31.SchemaObject => ({});
