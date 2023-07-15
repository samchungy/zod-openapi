import type { ZodType, ZodTypeDef } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import {
  type ComponentsObject,
  type CreationType,
  type SchemaComponent,
  createComponentSchemaRef,
} from '../components';

import { enhanceWithMetadata } from './metadata';
import { createSchemaSwitch } from './parsers';
import { throwTransformError } from './parsers/transform';

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

export const createNewSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  newState: SchemaState,
  previousState: SchemaState,
  subpath: string[],
): oas31.ReferenceObject | oas31.SchemaObject => {
  newState.path.push(...subpath);
  if (newState.visited.has(zodSchema)) {
    throw new Error(
      `The schema at ${newState.path.join(
        ' > ',
      )} needs to be registered because it's circularly referenced`,
    );
  }
  newState.visited.add(zodSchema);
  const { effectType, param, header, ref, refType, ...additionalMetadata } =
    zodSchema._def.openapi ?? {};

  const schema = createSchemaSwitch(zodSchema, newState);
  const description = zodSchema.description;

  const schemaWithMetadata = enhanceWithMetadata(schema, {
    ...(description && { description }),
    ...additionalMetadata,
  });

  if (newState.effectType) {
    if (
      previousState.effectType &&
      newState.effectType !== previousState.effectType
    ) {
      throwTransformError(zodSchema, newState);
    }
    previousState.effectType = newState.effectType;
  }

  return schemaWithMetadata;
};

export const createNewRef = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  ref: string,
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): oas31.ReferenceObject => {
  state.components.schemas.set(zodSchema, {
    type: 'in-progress',
    ref,
  });

  const newState = newSchemaState({ ...state, visited: new Set() });

  const newSchema = createNewSchema(zodSchema, newState, state, subpath);

  state.components.schemas.set(zodSchema, {
    type: 'complete',
    ref,
    schemaObject: newSchema,
    ...(newState.effectType && { creationType: newState.effectType }),
  });

  return {
    $ref: createComponentSchemaRef(ref),
  };
};

export const createExistingRef = (
  component: SchemaComponent | undefined,
  state: SchemaState,
): oas31.ReferenceObject | undefined => {
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

  if (component && component.type === 'in-progress') {
    return {
      $ref: createComponentSchemaRef(component.ref),
    };
  }
  return;
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
  const existingRef = createExistingRef(component, state);

  if (existingRef) {
    return existingRef;
  }

  const ref = zodSchema._def.openapi?.ref ?? component?.ref;
  if (ref) {
    return createNewRef(ref, zodSchema, state, subpath);
  }

  return createNewSchema(zodSchema, newSchemaState(state), state, subpath);
};
