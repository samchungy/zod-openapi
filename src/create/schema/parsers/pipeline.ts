import type { ZodPipeline, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaOrRef } from '../../schema';

import { throwTransformError } from './transform';

export const createPipelineSchema = (
  zodPipeline: ZodPipeline<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodPipeline._def.openapi?.effectType === 'input') {
    return createSchemaOrRef(zodPipeline._def.in as ZodTypeAny, state, [
      'pipeline input',
    ]);
  }

  if (zodPipeline._def.openapi?.effectType === 'output') {
    return createSchemaOrRef(zodPipeline._def.out as ZodTypeAny, state, [
      'pipeline output',
    ]);
  }

  if (state.type === 'input') {
    if (state.effectType === 'output') {
      throwTransformError(zodPipeline, state);
    }
    state.effectType = 'input';
    return createSchemaOrRef(zodPipeline._def.in as ZodTypeAny, state, [
      'pipeline input',
    ]);
  }

  if (state.effectType === 'input') {
    throwTransformError(zodPipeline, state);
  }
  state.effectType = 'output';
  return createSchemaOrRef(zodPipeline._def.out as ZodTypeAny, state, [
    'pipeline output',
  ]);
};
