import type { ArrayCardinality, ZodArray, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createArraySchema = <
  T extends ZodTypeAny,
  Cardinality extends ArrayCardinality = 'many',
>(
  zodArray: ZodArray<T, Cardinality>,
  state: SchemaState,
): oas31.SchemaObject => {
  const zodType = zodArray._def.type;
  const minItems =
    zodArray._def.exactLength?.value ?? zodArray._def.minLength?.value;
  const maxItems =
    zodArray._def.exactLength?.value ?? zodArray._def.maxLength?.value;
  return {
    type: 'array',
    items: createSchemaObject(zodType, state, ['array items']),
    ...(minItems !== undefined && { minItems }),
    ...(maxItems !== undefined && { maxItems }),
  };
};
