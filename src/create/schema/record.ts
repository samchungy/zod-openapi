import { oas31 } from 'openapi3-ts';
import { ZodRecord, ZodTypeAny } from 'zod';

import { ComponentsObject } from '../components';

import { createSchemaOrRef } from '.';

export const createRecordSchema = (
  zodRecord: ZodRecord<any, any>,
  components: ComponentsObject,
): oas31.SchemaObject => ({
  type: 'object',
  additionalProperties: createSchemaOrRef(
    zodRecord.valueSchema as ZodTypeAny,
    components,
  ),
});
