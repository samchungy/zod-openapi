import { oas31 } from 'openapi3-ts';
import { ZodLiteral } from 'zod';

export const createLiteralSchema = (
  zodLiteral: ZodLiteral<any>,
): oas31.SchemaObject => ({
  type: typeof zodLiteral.value as oas31.SchemaObject['type'],
  enum: [zodLiteral._def.value],
});
