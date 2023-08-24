import type { ZodSet, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createSetSchema = <Value extends ZodTypeAny = ZodTypeAny>(
  zodSet: ZodSet<Value>,
  state: SchemaState,
): oas31.SchemaObject => {
  const schema = zodSet._def.valueType;
  const minItems = zodSet._def.minSize?.value;
  const maxItems = zodSet._def.maxSize?.value;
  return {
    type: 'array',
    items: createSchemaObject(schema, state, ['set items']),
    uniqueItems: true,
    ...(minItems !== undefined && { minItems }),
    ...(maxItems !== undefined && { maxItems }),
  };
};
