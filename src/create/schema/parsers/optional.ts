import type { ZodOptional, ZodType, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createOptionalSchema = (
  zodOptional: ZodOptional<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => // Optional doesn't change OpenAPI schema
  createSchemaObject(zodOptional.unwrap() as ZodTypeAny, state, ['optional']);

export const isOptionalSchema = (
  zodSchema: ZodTypeAny,
  state: SchemaState,
): boolean => {
  if (
    isZodType(zodSchema, 'ZodOptional') ||
    isZodType(zodSchema, 'ZodDefault')
  ) {
    return true;
  }

  if (isZodType(zodSchema, 'ZodNullable') || isZodType(zodSchema, 'ZodCatch')) {
    return isOptionalSchema(zodSchema._def.innerType as ZodTypeAny, state);
  }

  if (isZodType(zodSchema, 'ZodEffects')) {
    return isOptionalSchema(zodSchema._def.schema as ZodTypeAny, state);
  }

  if (
    isZodType(zodSchema, 'ZodUnion') ||
    isZodType(zodSchema, 'ZodDiscriminatedUnion')
  ) {
    return (zodSchema._def.options as ZodTypeAny[]).some((schema) =>
      isOptionalSchema(schema, state),
    );
  }

  if (isZodType(zodSchema, 'ZodIntersection')) {
    return [zodSchema._def.left, zodSchema._def.right].some((schema) =>
      isOptionalSchema(schema as ZodTypeAny, state),
    );
  }

  if (isZodType(zodSchema, 'ZodPipeline')) {
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

  if (isZodType(zodSchema, 'ZodLazy')) {
    return isOptionalSchema(zodSchema._def.getter() as ZodType, state);
  }

  return zodSchema.isOptional();
};
