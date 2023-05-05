import type { ZodPipeline, ZodTypeAny } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createPipelineSchema = (
  zodPipeline: ZodPipeline<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (state.type === 'input') {
    return createSchemaOrRef(zodPipeline._def.in as ZodTypeAny, state);
  }
  return createSchemaOrRef(zodPipeline._def.out as ZodTypeAny, state);
};
