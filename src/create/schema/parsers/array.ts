import type { ArrayCardinality, ZodArray, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createArraySchema = <
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = 'many',
>(
  zodArray: ZodArray<T, Cardinality>,
  state: SchemaState,
): Schema => {
  const zodType = zodArray._def.type;
  const minItems =
    zodArray._def.exactLength?.value ?? zodArray._def.minLength?.value;
  const maxItems =
    zodArray._def.exactLength?.value ?? zodArray._def.maxLength?.value;

  const items = createSchemaObject(zodType, state, ['array items']);
  return {
    type: 'schema',
    schema: {
      type: 'array',
      items: items.schema,
      ...(minItems !== undefined && { minItems }),
      ...(maxItems !== undefined && { maxItems }),
    },
    effects: items.effects,
  };
};
