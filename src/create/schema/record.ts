import { oas31 } from 'openapi3-ts';
import { ZodRecord, ZodTypeAny } from 'zod';

import { Components } from '../components';

import { createSchemaOrRef } from '.';

export const createRecordSchema = (
  zodRecord: ZodRecord<any, any>,
  components: Components,
): oas31.SchemaObject => ({
  type: 'object',
  additionalProperties: createSchemaOrRef(
    zodRecord.valueSchema as ZodTypeAny,
    components,
  ),
});
