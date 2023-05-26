import {
  ZodArray,
  ZodBoolean,
  ZodBranded,
  ZodCatch,
  ZodDate,
  ZodDefault,
  ZodDiscriminatedUnion,
  ZodEffects,
  ZodEnum,
  ZodIntersection,
  ZodLazy,
  ZodLiteral,
  ZodNativeEnum,
  ZodNull,
  ZodNullable,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodPipeline,
  ZodRecord,
  ZodSet,
  ZodString,
  ZodTuple,
  type ZodType,
  type ZodTypeDef,
  ZodUnion,
  ZodUnknown,
} from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import {
  type ComponentsObject,
  type CreationType,
  createComponentSchemaRef,
} from '../components';

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
import { enhanceWithMetadata } from './metadata';
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
import { createSetSchema } from './set';
import { createStringSchema } from './string';
import { createTransformSchema, throwTransformError } from './transform';
import { createTupleSchema } from './tuple';
import { createUnionSchema } from './union';
import { createUnknownSchema } from './unknown';

export type LazyMap = Map<ZodType, true>;

export interface SchemaState {
  components: ComponentsObject;
  type: CreationType;
  effectType?: CreationType;
  path: string[];
  visited: Set<ZodType>;
}

export const newSchemaState = (state: SchemaState): SchemaState => ({
  type: state.type,
  components: state.components,
  path: [...state.path],
  visited: new Set(state.visited),
});

export const createSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): oas31.SchemaObject | oas31.ReferenceObject => {
  state.path.push(...subpath);
  if (state.visited.has(zodSchema)) {
    throw new Error(
      `The schema at ${state.path.join(
        ' > ',
      )} needs to be registered because it's circularly referenced`,
    );
  }
  state.visited.add(zodSchema);
  const schema = createSchemaWithMetadata(zodSchema, state);
  return schema;
};

export const createSchemaWithMetadata = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const { effectType, param, header, ref, refType, ...additionalMetadata } =
    zodSchema._def.openapi ?? {};
  const schemaOrRef = createSchemaSwitch(zodSchema, state);
  const description = zodSchema.description;

  return enhanceWithMetadata(schemaOrRef, {
    ...(description && { description }),
    ...additionalMetadata,
  });
};

const createSchemaSwitch = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (zodSchema._def.openapi?.type) {
    return createManualTypeSchema(zodSchema, state);
  }

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

  if (zodSchema instanceof ZodUnknown) {
    return createUnknownSchema(zodSchema);
  }

  if (zodSchema instanceof ZodLazy) {
    return createLazySchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodBranded) {
    return createBrandedSchema(zodSchema, state);
  }

  if (zodSchema instanceof ZodSet) {
    return createSetSchema(zodSchema, state);
  }

  return createManualTypeSchema(zodSchema, state);
};

export const createSchemaOrRef = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): oas31.ReferenceObject | oas31.SchemaObject => {
  const component = state.components.schemas.get(zodSchema);
  if (component && component.type === 'complete') {
    if (component.creationType && component.creationType !== state.type) {
      throw new Error(
        `schemaRef "${component.ref}" was created with a ZodTransform meaning that the input type is different from the output type. This type is currently being referenced in a response and request. Wrap it in a ZodPipeline, assign it a manual type or effectType`,
      );
    }
    return {
      $ref: createComponentSchemaRef(component.ref),
    };
  }

  if (component && component.type === 'inProgress') {
    return {
      $ref: createComponentSchemaRef(component.ref),
    };
  }

  const schemaRef = zodSchema._def.openapi?.ref ?? component?.ref;

  let newState;

  if (zodSchema._def.openapi?.ref || component?.type === 'partial') {
    state.components.schemas.set(zodSchema, {
      type: 'inProgress',
      ref: (zodSchema._def.openapi?.ref ?? component?.ref) as string,
    });
    newState = newSchemaState({ ...state, path: [], visited: new Set() });
  } else {
    newState = newSchemaState(state);
  }

  const schemaOrRef = createSchema(zodSchema, newState, subpath);

  if (newState.effectType) {
    if (state.effectType && newState.effectType !== state.effectType) {
      throwTransformError(zodSchema, newState);
    }
    state.effectType = newState.effectType;
  }

  if (schemaRef) {
    state.components.schemas.set(zodSchema, {
      type: 'complete',
      ref: schemaRef,
      schemaObject: schemaOrRef,
      ...(newState.effectType && { creationType: newState.effectType }),
    });

    return {
      $ref: createComponentSchemaRef(schemaRef),
    };
  }

  return schemaOrRef;
};
