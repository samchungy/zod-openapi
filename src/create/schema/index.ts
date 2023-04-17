import { oas31 } from 'openapi3-ts';
import {
  ZodArray,
  ZodBoolean,
  ZodCatch,
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
  ZodPipeline,
  ZodRecord,
  ZodString,
  ZodTuple,
  ZodType,
  ZodTypeDef,
  ZodUnion,
} from 'zod';

import {
  ComponentsObject,
  CreationType,
  createComponentSchemaRef,
} from '../components';

import { createArraySchema } from './array';
import { createBooleanSchema } from './boolean';
import { createCatchSchema } from './catch';
import { createDateSchema } from './date';
import { createDefaultSchema } from './default';
import { createDiscriminatedUnionSchema } from './discriminatedUnion';
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
import { createPipelineSchema } from './pipeline';
import { createPreprocessSchema } from './preprocess';
import { createRecordSchema } from './record';
import { createRefineSchema } from './refine';
import { createStringSchema } from './string';
import { createTransformSchema } from './transform';
import { createTupleSchema } from './tuple';
import { createUnionSchema } from './union';
import { createUnknownSchema } from './unknown';

export interface SchemaState {
  components: ComponentsObject;
  type: CreationType;
  effectType?: CreationType;
}

export const createSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodSchema instanceof ZodString) {
    return createStringSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNumber) {
    return createNumberSchema(zodSchema, state);
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
    return createNativeEnumSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodArray) {
    return createArraySchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodObject) {
    return createObjectSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodUnion) {
    return createUnionSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodDiscriminatedUnion) {
    return createDiscriminatedUnionSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodNull) {
    return createNullSchema(zodSchema);
  }

  if (zodSchema instanceof ZodNullable) {
    return createNullableSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodOptional) {
    return createOptionalSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodDefault) {
    return createDefaultSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodRecord) {
    return createRecordSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodTuple) {
    return createTupleSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodDate) {
    return createDateSchema(zodSchema);
  }

  if (zodSchema instanceof ZodPipeline) {
    return createPipelineSchema(zodSchema, state);
  }

  if (
    zodSchema instanceof ZodEffects &&
    zodSchema._def.effect.type === 'transform'
  ) {
    return createTransformSchema(zodSchema, state);
  }

  if (
    zodSchema instanceof ZodEffects &&
    zodSchema._def.effect.type === 'preprocess'
  ) {
    return createPreprocessSchema(zodSchema, state);
  }

  if (
    zodSchema instanceof ZodEffects &&
    zodSchema._def.effect.type === 'refinement'
  ) {
    return createRefineSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodNativeEnum) {
    return createNativeEnumSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodIntersection) {
    return createIntersectionSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodCatch) {
    return createCatchSchema(zodSchema, state);
  }

  return createUnknownSchema(zodSchema);
};

export const createRegisteredSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  schemaRef: string,
  state: SchemaState,
): oas31.ReferenceObject => {
  const component = state.components.schemas[schemaRef];
  if (component) {
    if (component.zodSchema !== zodSchema) {
      throw new Error(`schemaRef "${schemaRef}" is already registered`);
    }
    if (!component.types?.includes(state.type)) {
      throw new Error(
        `schemaRef "${schemaRef}" was created with a ZodEffect meaning that the input type is different from the output type. This type is currently being referenced in a response and request. Wrap the ZodEffect in a ZodPipeline to verify the contents of the effect`,
      );
    }
    return {
      $ref: createComponentSchemaRef(schemaRef),
    };
  }

  const newState: SchemaState = {
    components: state.components,
    type: state.type,
  };

  const schemaOrRef = createSchemaWithMetadata(zodSchema, newState);
  // Optional Objects can return a reference object
  if ('$ref' in schemaOrRef) {
    throw new Error('Unexpected Error: received a reference object');
  }

  state.components.schemas[schemaRef] = {
    schemaObject: schemaOrRef,
    zodSchema,
    types: newState?.effectType ? [newState.effectType] : ['input', 'output'],
  };

  if (newState.effectType) {
    state.effectType = newState.effectType;
  }

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
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaRef = zodSchema._def.openapi?.ref;
  if (schemaRef) {
    return createRegisteredSchema(zodSchema, schemaRef, state);
  }

  return createSchemaWithMetadata(zodSchema, state);
};
