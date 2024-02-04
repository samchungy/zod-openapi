import type { ZodOptional, ZodType, ZodTypeAny } from 'zod';

import { isZodType } from '../../../zodType';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createOptionalSchema = <T extends ZodTypeAny>(
  zodOptional: ZodOptional<T>,
  state: SchemaState,
): Schema => createSchemaObject(zodOptional.unwrap(), state, ['optional']); // Optional doesn't change OpenAPI schema

export const isOptionalSchema = (
  zodSchema: ZodTypeAny,
  state: SchemaState,
): boolean => {
  if (
    isZodType(zodSchema, 'ZodOptional') ||
    isZodType(zodSchema, 'ZodNever') ||
    isZodType(zodSchema, 'ZodUndefined')
  ) {
    return true;
  }

  if (isZodType(zodSchema, 'ZodDefault')) {
    return state.type === 'input';
  }

  if (isZodType(zodSchema, 'ZodNullable') || isZodType(zodSchema, 'ZodCatch')) {
    return isOptionalSchema(zodSchema._def.innerType, state);
  }

  if (isZodType(zodSchema, 'ZodEffects')) {
    return isOptionalSchema(zodSchema._def.schema, state);
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
      isOptionalSchema(schema, state),
    );
  }

  if (isZodType(zodSchema, 'ZodPipeline')) {
    if (state.type === 'input') {
      return isOptionalSchema(zodSchema._def.in, state);
    }

    if (state.type === 'output') {
      return isOptionalSchema(zodSchema._def.out, state);
    }
  }

  if (isZodType(zodSchema, 'ZodLazy')) {
    return isOptionalSchema(zodSchema._def.getter() as ZodType, state);
  }

  return zodSchema.isOptional();
};
