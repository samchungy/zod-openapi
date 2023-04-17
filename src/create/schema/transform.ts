import { oas31 } from 'openapi3-ts';
import { ZodEffects, ZodType } from 'zod';

import { createUnknownSchema } from './unknown';

import { SchemaState, createSchemaOrRef } from '.';

export const createTransformSchema = (
  zodTransform: ZodEffects<any, any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (state.type === 'input') {
    state.effectType = 'input';
    return createSchemaOrRef(zodTransform._def.schema as ZodType, state);
  }

  return createUnknownSchema(zodTransform);
};
