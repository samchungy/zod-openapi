import { oas31 } from 'openapi3-ts';
import { ZodArray, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from '.';

export const createArraySchema = (
  zodArray: ZodArray<any, any>,
): oas31.SchemaObject => {
  const zodType = zodArray._def.type as ZodTypeAny;
  return {
    type: 'array',
    items: createSchemaOrRef(zodType),
    minItems: zodArray._def.minLength?.value,
    maxItems: zodArray._def.maxLength?.value,
  };
};
