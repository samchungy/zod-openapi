import { oas31 } from 'openapi3-ts';
import { ZodRecord, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from './schema';

export const createRecordSchema = (
  zodRecord: ZodRecord<any, any>,
): oas31.SchemaObject => ({
  type: 'object',
  additionalProperties: createSchemaOrRef(zodRecord.valueSchema as ZodTypeAny),
});
