import { oas31 } from 'openapi3-ts';
import { ZodArray, ZodTypeAny } from 'zod';

import { Components } from '../components';

import { createSchemaOrRef } from '.';

export const createArraySchema = (
  zodArray: ZodArray<any, any>,
  components: Components,
): oas31.SchemaObject => {
  const zodType = zodArray._def.type as ZodTypeAny;
  return {
    type: 'array',
    items: createSchemaOrRef(zodType, components),
    minItems:
      zodArray._def.exactLength?.value ?? zodArray._def.minLength?.value,
    maxItems:
      zodArray._def.exactLength?.value ?? zodArray._def.maxLength?.value,
  };
};
