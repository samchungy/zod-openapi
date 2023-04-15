import { oas31 } from 'openapi3-ts';
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodIntersection,
  ZodLiteral,
  ZodNativeEnum,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodRecord,
  ZodString,
  ZodTuple,
  ZodType,
  ZodTypeDef,
  ZodUnion,
} from 'zod';

import { ComponentsObject, createComponentSchemaRef } from '../components';

import { createArraySchema } from './array';
import { createBooleanSchema } from './boolean';
import { createDateSchema } from './date';
import { createDefaultSchema } from './default';
import { createDiscriminatedUnionSchema } from './discriminatedUnion';
import { createEffectsSchema } from './effects';
import { createEnumSchema } from './enum';
import { createIntersectionSchema } from './intersection';
import { createLiteralSchema } from './literal';
import { createSchemaWithMetadata } from './metadata';
import { createNativeEnumSchema } from './nativeEnum';
import { createNullSchema } from './null';
import { createNullableSchema } from './nullable';
import { createNumberSchema } from './number';
import { createObjectSchema } from './object';
import { createOptionalSchema } from './optional';
import { createRecordSchema } from './record';
import { createStringSchema } from './string';
import { createTupleSchema } from './tuple';
import { createUnionSchema } from './union';

export const createSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  components: ComponentsObject,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodSchema instanceof ZodString) {
    return createStringSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNumber) {
    return createNumberSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodBoolean) {
    return createBooleanSchema(zodSchema);
  }

  if (zodSchema instanceof ZodEnum) {
    return createEnumSchema(zodSchema);
  }

  if (zodSchema instanceof ZodLiteral) {
    return createLiteralSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNativeEnum) {
    return createNativeEnumSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodArray) {
    return createArraySchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodObject) {
    return createObjectSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodUnion) {
    return createUnionSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodDiscriminatedUnion) {
    return createDiscriminatedUnionSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodNull) {
    return createNullSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNullable) {
    return createNullableSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodOptional) {
    return createOptionalSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodDefault) {
    return createDefaultSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodRecord) {
    return createRecordSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodTuple) {
    return createTupleSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodDate) {
    return createDateSchema(zodSchema);
  }

  if (
    zodSchema instanceof ZodEffects &&
    (zodSchema._def.effect.type === 'refinement' ||
      zodSchema._def.effect.type === 'preprocess')
  ) {
    return createEffectsSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodNativeEnum) {
    return createNativeEnumSchema(zodSchema, components);
  }

  if (zodSchema instanceof ZodIntersection) {
    return createIntersectionSchema(zodSchema, components);
  }

  if (!zodSchema._def.openapi?.type) {
    throw new Error(
      `Unknown schema ${zodSchema.toString()}. Please assign it a manual type`,
    );
  }

  return {};
};

export const createRegisteredSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  schemaRef: string,
  components: ComponentsObject,
): oas31.ReferenceObject => {
  const component = components.schemas[schemaRef];
  if (component) {
    if (component.zodSchema !== zodSchema) {
      throw new Error(`schemaRef "${schemaRef}" is already registered`);
    }
    return {
      $ref: createComponentSchemaRef(schemaRef),
    };
  }

  // Optional Objects can return a reference object
  const schemaOrRef = createSchemaWithMetadata(zodSchema, components);
  if ('$ref' in schemaOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  components.schemas[schemaRef] = {
    schemaObject: schemaOrRef,
    zodSchema,
  };

  return {
    $ref: createComponentSchemaRef(schemaRef),
  };
};

export const createSchemaOrRef = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  components: ComponentsObject,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaRef = zodSchema._def.openapi?.ref;
  if (schemaRef) {
    return createRegisteredSchema(zodSchema, schemaRef, components);
  }

  return createSchemaWithMetadata(zodSchema, components);
};
