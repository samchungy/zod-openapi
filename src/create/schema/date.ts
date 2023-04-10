import { oas31 } from 'openapi3-ts';
import { ZodDate } from 'zod';

export const createDateSchema = (_zodDate: ZodDate): oas31.SchemaObject => ({
  type: 'string',
});
