import {
  ZodCatch,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodIntersection,
  ZodLazy,
  ZodNullable,
  ZodOptional,
  ZodPipeline,
  type ZodType,
  type ZodTypeAny,
  ZodUnion,
} from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createOptionalSchema = (
  zodOptional: ZodOptional<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => // Optional doesn't change OpenAPI schema
  createSchemaOrRef(zodOptional.unwrap() as ZodTypeAny, state, 'optional');
export const isOptionalSchema = (
  zodSchema: ZodTypeAny,
  state: SchemaState,
): boolean => {
  if (zodSchema instanceof ZodOptional || zodSchema instanceof ZodDefault) {
    return true;
  }

  if (zodSchema instanceof ZodNullable || zodSchema instanceof ZodCatch) {
    return isOptionalSchema(zodSchema._def.innerType as ZodTypeAny, state);
  }

  if (zodSchema instanceof ZodEffects) {
    return isOptionalSchema(zodSchema._def.schema as ZodTypeAny, state);
  }

  if (
    zodSchema instanceof ZodUnion ||
    zodSchema instanceof ZodDiscriminatedUnion
  ) {
    return (zodSchema._def.options as ZodTypeAny[]).some((schema) =>
      isOptionalSchema(schema, state),
    );
  }

  if (zodSchema instanceof ZodIntersection) {
    return [zodSchema._def.left, zodSchema._def.right].some((schema) =>
      isOptionalSchema(schema as ZodTypeAny, state),
    );
  }

  if (zodSchema instanceof ZodPipeline) {
    if (
      state.effectType === 'input' ||
      (state.type === 'input' && state.effectType !== 'output')
    ) {
      return isOptionalSchema(zodSchema._def.in as ZodTypeAny, state);
    }

    if (
      state.effectType === 'output' ||
      (state.type === 'output' && state.effectType !== 'input')
    ) {
      return isOptionalSchema(zodSchema._def.out as ZodTypeAny, state);
    }
  }

  if (zodSchema instanceof ZodLazy) {
    return isOptionalSchema(zodSchema._def.getter() as ZodType, state);
  }

  return zodSchema.isOptional();
};
