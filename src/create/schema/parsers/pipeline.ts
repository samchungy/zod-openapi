import type { ZodPipeline, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createPipelineSchema = <
  A extends ZodTypeAny,
  B extends ZodTypeAny,
>(
  zodPipeline: ZodPipeline<A, B>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodPipeline._def.openapi?.effectType === 'input') {
    return createSchemaObject(zodPipeline._def.in, state, ['pipeline input']);
  }

  if (zodPipeline._def.openapi?.effectType === 'output') {
    return createSchemaObject(zodPipeline._def.out, state, ['pipeline output']);
  }

  if (state.type === 'input') {
    state.effectType = 'input';
    return createSchemaObject(zodPipeline._def.in, state, ['pipeline input']);
  }

  state.effectType = 'output';
  return createSchemaObject(zodPipeline._def.out, state, ['pipeline output']);
};
