import type { ZodOptional, ZodType, ZodTypeAny } from 'zod';

import { isZodType } from '../../../zodType';
import type { Effect } from '../../components';
import { type Schema, type SchemaState, createSchemaObject } from '../schema';

import { flattenEffects } from './transform';

export const createOptionalSchema = <T extends ZodTypeAny>(
  zodOptional: ZodOptional<T>,
  state: SchemaState,
): Schema => createSchemaObject(zodOptional.unwrap(), state, ['optional']); // Optional doesn't change OpenAPI schema

type OptionalResult = { optional: boolean; effects?: Effect[] };

export const isOptionalSchema = (
  zodSchema: ZodTypeAny,
  state: SchemaState,
): OptionalResult => {
  if (
    isZodType(zodSchema, 'ZodOptional') ||
    isZodType(zodSchema, 'ZodNever') ||
    isZodType(zodSchema, 'ZodUndefined') ||
    (isZodType(zodSchema, 'ZodLiteral') && zodSchema._def.value === undefined)
  ) {
    return { optional: true };
  }

  if (isZodType(zodSchema, 'ZodDefault')) {
    if (zodSchema._def.openapi?.effectType === 'input') {
      return { optional: true };
    }

    if (zodSchema._def.openapi?.effectType === 'output') {
      return { optional: false };
    }

    return {
      optional: state.type === 'input',
      effects: [
        {
          type: 'schema',
          creationType: state.type,
          zodType: zodSchema,
          path: [...state.path],
        },
      ],
    };
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
    const results = (zodSchema._def.options as ZodTypeAny[]).map((schema) =>
      isOptionalSchema(schema, state),
    );
    return results.reduce(
      (acc, result) => ({
        optional: acc.optional || result.optional,
        effects: flattenEffects([acc.effects, result.effects]),
      }),
      { optional: false },
    );
  }

  if (isZodType(zodSchema, 'ZodIntersection')) {
    const results = [zodSchema._def.left, zodSchema._def.right].map((schema) =>
      isOptionalSchema(schema, state),
    );
    return results.reduce(
      (acc, result) => ({
        optional: acc.optional || result.optional,
        effects: flattenEffects([acc.effects, result.effects]),
      }),
      { optional: false },
    );
  }

  if (isZodType(zodSchema, 'ZodPipeline')) {
    const type = zodSchema._def.openapi?.effectType ?? state.type;

    if (type === 'input') {
      return isOptionalSchema(zodSchema._def.in, state);
    }

    if (type === 'output') {
      return isOptionalSchema(zodSchema._def.out, state);
    }
  }

  if (isZodType(zodSchema, 'ZodLazy')) {
    return isOptionalSchema(zodSchema._def.getter() as ZodType, state);
  }

  return { optional: zodSchema.isOptional() };
};
