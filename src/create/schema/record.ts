import { oas31 } from 'openapi3-ts';
import { ZodRecord, ZodTypeAny } from 'zod';

import { SchemaState, createSchemaOrRef } from '.';

export const createRecordSchema = (
  zodRecord: ZodRecord<any, any>,
  state: SchemaState,
): oas31.SchemaObject => ({
  type: 'object',
  additionalProperties: createSchemaOrRef(
    zodRecord.valueSchema as ZodTypeAny,
    state,
  ),
});
