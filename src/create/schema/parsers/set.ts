import type { ZodSet, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createSetSchema = <Value extends ZodTypeAny = ZodTypeAny>(
  zodSet: ZodSet<Value>,
  state: SchemaState,
): Schema => {
  const schema = zodSet._def.valueType;
  const minItems = zodSet._def.minSize?.value;
  const maxItems = zodSet._def.maxSize?.value;
  const itemSchema = createSchemaObject(schema, state, ['set items']);
  return {
    type: 'schema',
    schema: {
      type: 'array',
      items: itemSchema.schema,
      uniqueItems: true,
      ...(minItems !== undefined && { minItems }),
      ...(maxItems !== undefined && { maxItems }),
    },
    effect: itemSchema.effect,
  };
};
