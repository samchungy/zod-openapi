import { oas31 } from 'openapi3-ts';
import { ZodArray, ZodTypeAny } from 'zod';

import { Components } from '../components';

import { createSchemaOrRef } from '.';

export const createArraySchema = (
  zodArray: ZodArray<any, any>,
  components: Components,
): oas31.SchemaObject => {
  const zodType = zodArray._def.type as ZodTypeAny;
  const minItems =
    zodArray._def.exactLength?.value ?? zodArray._def.minLength?.value;
  const maxItems =
    zodArray._def.exactLength?.value ?? zodArray._def.maxLength?.value;
  return {
    type: 'array',
    items: createSchemaOrRef(zodType, components),
    ...(minItems !== undefined && { minItems }),
    ...(maxItems !== undefined && { maxItems }),
  };
};
