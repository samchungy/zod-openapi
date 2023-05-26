import type { ZodEffects, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { createManualTypeSchema } from './manual';

import { type SchemaState, createSchemaOrRef } from '.';

export const createTransformSchema = (
  zodTransform: ZodEffects<any, any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodTransform._def.openapi?.effectType === 'output') {
    return createManualTypeSchema(zodTransform);
  }

  if (zodTransform._def.openapi?.effectType === 'input') {
    return createSchemaOrRef(zodTransform._def.schema as ZodType, state, [
      'transform input',
    ]);
  }

  if (state.type === 'output') {
    return createManualTypeSchema(zodTransform);
  }

  if (state.effectType === 'output') {
    throwTransformError(zodTransform, state);
  }
  state.effectType = 'input';
  return createSchemaOrRef(zodTransform._def.schema as ZodType, state, [
    'transform input',
  ]);
};

export const throwTransformError = (zodType: ZodType, state: SchemaState) => {
  throw new Error(
    `${JSON.stringify(zodType)} at ${state.path.join(
      ' > ',
    )} contains a transform but is used in both an input and an output. This is likely a mistake. Set an \`effectType\` to resolve`,
  );
};
