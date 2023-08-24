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
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  newState: SchemaState,
  subpath: string[],
): Schema => {
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

  return {
    schema: schemaWithMetadata,
    newState,
  };
};

export const createNewRef = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  ref: string,
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): Schema => {
  state.components.schemas.set(zodSchema, {
    type: 'in-progress',
    ref,
  });

  const newSchema = createNewSchema(
    zodSchema,
    newSchemaState({ ...state, visited: new Set() }),
    subpath,
  );

  state.components.schemas.set(zodSchema, {
    type: 'complete',
    ref,
    schemaObject: newSchema.schema,
    creationType: newSchema.newState?.effectType,
  });

  return {
    schema: { $ref: createComponentSchemaRef(ref) },
    newState: newSchema.newState,
  };
};

export const createExistingRef = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  component: SchemaComponent | undefined,
  state: SchemaState,
  subpath: string[],
): Schema | undefined => {
  const newState = newSchemaState(state);
  newState.path.push(...subpath);

  if (component && component.type === 'complete') {
    if (component.creationType && component.creationType !== state.type) {
      throwTransformError(zodSchema, newState);
    }

    return {
      schema: { $ref: createComponentSchemaRef(component.ref) },
      newState: {
        ...newState,
        effectType: component.creationType,
      },
    };
  }

  if (component && component.type === 'in-progress') {
    return {
      schema: { $ref: createComponentSchemaRef(component.ref) },
      newState,
    };
  }

  return;
};

type Schema = {
  schema: oas31.ReferenceObject | oas31.SchemaObject;
  newState: SchemaState;
};

export const createSchemaOrRef = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): Schema => {
  const component = state.components.schemas.get(zodSchema);
  const existingRef = createExistingRef(zodSchema, component, state, subpath);

  if (existingRef) {
    return existingRef;
  }

  const ref = zodSchema._def.openapi?.ref ?? component?.ref;
  if (ref) {
    return createNewRef(ref, zodSchema, state, subpath);
  }

  return createNewSchema(zodSchema, newSchemaState(state), subpath);
};

export const createSchemaObject = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): oas31.ReferenceObject | oas31.SchemaObject => {
  const { schema, newState } = createSchemaOrRef(zodSchema, state, subpath);
  if (newState?.effectType) {
    if (
      state.type !== newState?.effectType ||
      (state.effectType && newState.effectType !== state.effectType)
    ) {
      throwTransformError(zodSchema, newState);
    }
    state.effectType = newState.effectType;
  }
  return schema;
};
