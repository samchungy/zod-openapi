import {
  ZodDefault,
  ZodEffects,
  ZodIntersection,
  ZodNullable,
  type ZodOptional,
  ZodPipeline,
  type ZodTypeAny,
  ZodUnion,
} from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createOptionalSchema = (
  zodOptional: ZodOptional<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  // Optional doesn't change OpenAPI schema
  createSchemaOrRef(zodOptional.unwrap() as ZodTypeAny, state);

export const isOptionalSchema = (
  zodSchema: ZodTypeAny,
  state: SchemaState,
): boolean => {
  if (zodSchema instanceof ZodEffects) {
    return isOptionalSchema(zodSchema._def.schema as ZodTypeAny, state);
  }

  if (zodSchema instanceof ZodDefault) {
    return isOptionalSchema(zodSchema._def.innerType as ZodTypeAny, state);
  }

  if (zodSchema instanceof ZodUnion) {
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

  if (zodSchema instanceof ZodNullable || zodSchema instanceof ZodDefault) {
    return isOptionalSchema(zodSchema._def.innerType as ZodTypeAny, state);
  }

  return zodSchema.isOptional();
};
