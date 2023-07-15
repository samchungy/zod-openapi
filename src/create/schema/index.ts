import type { ZodType, ZodTypeDef } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import {
  type ComponentsObject,
  type CreationType,
  createComponentSchemaRef,
} from '../components';

import { createSchemaSwitch } from './parsers';
import { enhanceWithMetadata } from './parsers/metadata';
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
