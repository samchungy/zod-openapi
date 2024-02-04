import type { ZodPipeline, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { resolveEffect } from './transform';

export const createPipelineSchema = <
  A extends ZodTypeAny,
  B extends ZodTypeAny,
>(
  zodPipeline: ZodPipeline<A, B>,
  state: SchemaState,
): Schema => {
  if (zodPipeline._def.openapi?.effectType === 'input') {
    return createSchemaObject(zodPipeline._def.in, state, ['pipeline input']);
  }

  if (zodPipeline._def.openapi?.effectType === 'output') {
    return createSchemaObject(zodPipeline._def.out, state, ['pipeline output']);
  }

  if (state.type === 'input') {
    const schema = createSchemaObject(zodPipeline._def.in, state, [
      'pipeline input',
    ]);
    return {
      ...schema,
      effect: resolveEffect([
        {
          type: 'input',
          path: [...state.path],
          zodType: zodPipeline,
        },
        schema.effect,
      ]),
    };
  }

  const schema = createSchemaObject(zodPipeline._def.out, state, [
    'pipeline output',
  ]);
  return {
    ...schema,
    effect: resolveEffect([
      {
        type: 'output',
        path: [...state.path],
        zodType: zodPipeline,
      },
      schema.effect,
    ]),
  };
};
