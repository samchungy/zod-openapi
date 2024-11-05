import type { ZodType, ZodTypeDef } from 'zod';

import { isZodType } from '../../../zodType';
import type { Schema, SchemaState } from '../../schema';

import { createArraySchema } from './array';
import { createBooleanSchema } from './boolean';
import { createBrandedSchema } from './brand';
import { createCatchSchema } from './catch';
import { createDateSchema } from './date';
import { createDefaultSchema } from './default';
import { createDiscriminatedUnionSchema } from './discriminatedUnion';
import { createEnumSchema } from './enum';
import { createIntersectionSchema } from './intersection';
import { createLazySchema } from './lazy';
import { createLiteralSchema } from './literal';
import { createManualTypeSchema } from './manual';
import { createNativeEnumSchema } from './nativeEnum';
import { createNullSchema } from './null';
import { createNullableSchema } from './nullable';
import { createNumberSchema } from './number';
import { createObjectSchema } from './object';
import { createOptionalSchema } from './optional';
import { createPipelineSchema } from './pipeline';
import { createPreprocessSchema } from './preprocess';
import { createReadonlySchema } from './readonly';
import { createRecordSchema } from './record';
import { createRefineSchema } from './refine';
import { createSetSchema } from './set';
import { createStringSchema } from './string';
import { createTransformSchema } from './transform';
import { createTupleSchema } from './tuple';
import { createUnionSchema } from './union';
import { createUnknownSchema } from './unknown';

export const createSchemaSwitch = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): Schema => {
  if (zodSchema._def.zodOpenApi?.openapi?.type) {
    return createManualTypeSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodString')) {
    return createStringSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodNumber')) {
    return createNumberSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodBoolean')) {
    return createBooleanSchema(zodSchema);
  }

  if (isZodType(zodSchema, 'ZodEnum')) {
    return createEnumSchema(zodSchema);
  }

  if (isZodType(zodSchema, 'ZodLiteral')) {
    return createLiteralSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodNativeEnum')) {
    return createNativeEnumSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodArray')) {
    return createArraySchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodObject')) {
    return createObjectSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodUnion')) {
    return createUnionSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodDiscriminatedUnion')) {
    return createDiscriminatedUnionSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodNull')) {
    return createNullSchema();
  }

  if (isZodType(zodSchema, 'ZodNullable')) {
    return createNullableSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodOptional')) {
    return createOptionalSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodReadonly')) {
    return createReadonlySchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodDefault')) {
    return createDefaultSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodRecord')) {
    return createRecordSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodTuple')) {
    return createTupleSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodDate')) {
    return createDateSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodPipeline')) {
    return createPipelineSchema(zodSchema, state);
  }

  if (
    isZodType(zodSchema, 'ZodEffects') &&
    zodSchema._def.effect.type === 'transform'
  ) {
    return createTransformSchema(zodSchema, state);
  }

  if (
    isZodType(zodSchema, 'ZodEffects') &&
    zodSchema._def.effect.type === 'preprocess'
  ) {
    return createPreprocessSchema(zodSchema, state);
  }

  if (
    isZodType(zodSchema, 'ZodEffects') &&
    zodSchema._def.effect.type === 'refinement'
  ) {
    return createRefineSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodNativeEnum')) {
    return createNativeEnumSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodIntersection')) {
    return createIntersectionSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodCatch')) {
    return createCatchSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodUnknown') || isZodType(zodSchema, 'ZodAny')) {
    return createUnknownSchema(zodSchema);
  }

  if (isZodType(zodSchema, 'ZodLazy')) {
    return createLazySchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodBranded')) {
    return createBrandedSchema(zodSchema, state);
  }

  if (isZodType(zodSchema, 'ZodSet')) {
    return createSetSchema(zodSchema, state);
  }

  return createManualTypeSchema(zodSchema, state);
};
