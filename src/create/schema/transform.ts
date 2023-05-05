import type { ZodEffects, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import { throwTransformError } from '../errors';

import { createManualTypeSchema } from './manual';

import { type SchemaState, createSchemaOrRef } from '.';

export const createTransformSchema = (
  zodTransform: ZodEffects<any, any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const creationType = zodTransform._def.openapi?.effectType ?? state.type;
  if (creationType === 'output') {
    return createManualTypeSchema(zodTransform);
  }

  if (!zodTransform._def.openapi?.effectType && state.type === 'input') {
    if (state.effectType && state.effectType !== 'input') {
      throwTransformError(zodTransform);
    }
    state.effectType = 'input';
  }
  return createSchemaOrRef(zodTransform._def.schema as ZodType, state);
};
