import type { ZodArray, ZodTypeAny } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createArraySchema = (
  zodArray: ZodArray<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const zodType = zodArray._def.type as ZodTypeAny;
  const minItems =
    zodArray._def.exactLength?.value ?? zodArray._def.minLength?.value;
  const maxItems =
    zodArray._def.exactLength?.value ?? zodArray._def.maxLength?.value;
  return {
    type: 'array',
    items: createSchemaOrRef(zodType, state, 'array items'),
    ...(minItems !== undefined && { minItems }),
    ...(maxItems !== undefined && { maxItems }),
  };
};
