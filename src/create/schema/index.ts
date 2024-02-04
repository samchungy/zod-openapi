import type { ZodType, ZodTypeDef } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import {
  type ComponentsObject,
  type CreationType,
  type Effect,
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
  path: string[];
  visited: Set<ZodType>;
}

export const createNewSchema = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): Schema => {
  if (state.visited.has(zodSchema)) {
    throw new Error(
      `The schema at ${state.path.join(
        ' > ',
      )} needs to be registered because it's circularly referenced`,
    );
  }
  state.visited.add(zodSchema);
  const {
    effectType,
    param,
    header,
    ref,
    refType,
    unionOneOf,
    ...additionalMetadata
  } = zodSchema._def.openapi ?? {};

  const schema = createSchemaSwitch(zodSchema, state);
  const description = zodSchema.description;

  const schemaWithMetadata = enhanceWithMetadata(schema, {
    ...(description && { description }),
    ...additionalMetadata,
  });
  state.visited.delete(zodSchema);
  return schemaWithMetadata;
};

export const createNewRef = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  ref: string,
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): Schema => {
  state.components.schemas.set(zodSchema, {
    type: 'in-progress',
    ref,
  });

  const newSchema = createNewSchema(zodSchema, {
    ...state,
    visited: new Set(),
  });

  state.components.schemas.set(zodSchema, {
    type: 'complete',
    ref,
    schemaObject: newSchema.schema,
    effect: newSchema.effect,
  });

  return {
    type: 'ref',
    schema: { $ref: createComponentSchemaRef(ref) },
    effect: newSchema.effect
      ? {
          type: newSchema.effect.type,
          path: [...state.path],
          zodType: zodSchema,
          component: {
            ref,
            path: newSchema.effect.path,
            zodType: newSchema.effect.zodType,
          },
        }
      : undefined,
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
): Schema | undefined => {
  if (component && component.type === 'complete') {
    return {
      type: 'ref',
      schema: { $ref: createComponentSchemaRef(component.ref) },
      effect: component.effect
        ? {
            type: component.effect.type,
            path: [...state.path],
            zodType: zodSchema,
            component: {
              ref: component.ref,
              path: component.effect.path,
              zodType: component.effect.zodType,
            },
          }
        : undefined,
    };
  }

  if (component && component.type === 'in-progress') {
    return {
      type: 'ref',
      schema: { $ref: createComponentSchemaRef(component.ref) },
    };
  }

  return;
};

export type BaseObject = {
  effect?: Effect;
};

export type RefObject = BaseObject & {
  type: 'ref';
  schema: oas31.ReferenceObject;
};

export type SchemaObject = BaseObject & {
  type: 'schema';
  schema: oas31.SchemaObject;
};

export type Schema = SchemaObject | RefObject;

export const createSchemaOrRef = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): Schema => {
  const component = state.components.schemas.get(zodSchema);
  const existingRef = createExistingRef(zodSchema, component, state);

  if (existingRef) {
    return existingRef;
  }

  const ref = zodSchema._def.openapi?.ref ?? component?.ref;
  if (ref) {
    return createNewRef(ref, zodSchema, state);
  }

  return createNewSchema(zodSchema, state);
};

export const createSchemaObject = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): Schema => {
  state.path.push(...subpath);
  const schema = createSchemaOrRef(zodSchema, state);
  if (schema.effect?.type && state.type !== schema.effect.type) {
    throwTransformError(schema.effect);
  }
  state.path.pop();
  return schema;
};
