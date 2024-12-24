import type { ZodType, ZodTypeDef } from 'zod';

import { currentSymbol, previousSymbol } from '../../extendZodTypes';
import type { oas30, oas31 } from '../../openapi3-ts/dist';
import {
  type ComponentsObject,
  type CreationType,
  type Effect,
  type SchemaComponent,
  createComponentSchemaRef,
} from '../components';

import { enhanceWithMetadata } from './metadata';
import { createSchemaSwitch } from './parsers';
import { verifyEffects } from './parsers/transform';
import type { CreateSchemaOptions } from './single';

export type LazyMap = Map<ZodType, true>;

export interface SchemaState {
  components: ComponentsObject;
  type: CreationType;
  path: string[];
  visited: Set<ZodType>;
  documentOptions?: CreateSchemaOptions;
}

export const createNewSchema = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>({
  zodSchema,
  previous,
  state,
}: {
  zodSchema: ZodType<Output, Def, Input>;
  previous: RefObject | undefined;
  state: SchemaState;
}): Schema => {
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
  } = zodSchema._def.zodOpenApi?.openapi ?? {};

  const schema = createSchemaSwitch(zodSchema, previous, state);

  const schemaWithMetadata = enhanceWithMetadata(
    schema,
    additionalMetadata,
    state,
    previous,
  );
  state.visited.delete(zodSchema);
  return schemaWithMetadata;
};

export const createNewRef = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>({
  previous,
  ref,
  zodSchema,
  state,
}: {
  ref: string;
  zodSchema: ZodType<Output, Def, Input>;
  previous: RefObject | undefined;
  state: SchemaState;
}): Schema => {
  state.components.schemas.set(zodSchema, {
    type: 'in-progress',
    ref,
  });

  const newSchema = createNewSchema({
    zodSchema,
    previous,
    state: {
      ...state,
      visited: new Set(),
    },
  });

  state.components.schemas.set(zodSchema, {
    type: 'complete',
    ref,
    schemaObject: newSchema.schema,
    effects: newSchema.effects,
  });

  return {
    type: 'ref',
    schema: {
      $ref: createComponentSchemaRef(
        ref,
        state.documentOptions?.componentRefPath,
      ),
    },
    schemaObject: newSchema.schema,
    effects: newSchema.effects
      ? [
          {
            type: 'component',
            zodType: zodSchema,
            path: [...state.path],
          },
        ]
      : undefined,
    zodType: zodSchema,
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
): RefObject | undefined => {
  if (component && component.type === 'complete') {
    return {
      type: 'ref',
      schema: {
        $ref: createComponentSchemaRef(
          component.ref,
          state.documentOptions?.componentRefPath,
        ),
      },
      schemaObject: component.schemaObject,
      effects: component.effects
        ? [
            {
              type: 'component',
              zodType: zodSchema,
              path: [...state.path],
            },
          ]
        : undefined,
      zodType: zodSchema,
    };
  }

  if (component && component.type === 'in-progress') {
    return {
      type: 'ref',
      schema: {
        $ref: createComponentSchemaRef(
          component.ref,
          state.documentOptions?.componentRefPath,
        ),
      },
      schemaObject: undefined,
      effects: [
        {
          type: 'component',
          zodType: zodSchema,
          path: [...state.path],
        },
      ],
      zodType: zodSchema,
    };
  }

  return;
};

export type BaseObject = {
  effects?: Effect[];
};

export type RefObject = BaseObject & {
  type: 'ref';
  schema: oas31.ReferenceObject;
  schemaObject:
    | oas31.SchemaObject
    | oas31.ReferenceObject
    | oas30.ReferenceObject
    | oas30.SchemaObject
    | undefined;
  zodType: ZodType;
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
  onlyRef?: boolean,
): Schema | undefined => {
  const component = state.components.schemas.get(zodSchema);
  const existingRef = createExistingRef(zodSchema, component, state);

  if (existingRef) {
    return existingRef;
  }

  const previous = zodSchema._def.zodOpenApi?.[previousSymbol]
    ? (createSchemaOrRef(
        zodSchema._def.zodOpenApi[previousSymbol],
        state,
        true,
      ) as RefObject | undefined)
    : undefined;

  const current =
    zodSchema._def.zodOpenApi?.[currentSymbol] &&
    zodSchema._def.zodOpenApi[currentSymbol] !== zodSchema
      ? (createSchemaOrRef(
          zodSchema._def.zodOpenApi[currentSymbol],
          state,
          true,
        ) as RefObject | undefined)
      : undefined;

  const ref = zodSchema._def.zodOpenApi?.openapi?.ref ?? component?.ref;
  if (ref) {
    return current
      ? createNewSchema({ zodSchema, previous: current, state })
      : createNewRef({ ref, zodSchema, previous, state });
  }

  if (onlyRef) {
    return previous ?? current;
  }

  return createNewSchema({ zodSchema, previous: previous ?? current, state });
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

  if (!schema) {
    throw new Error('Schema does not exist');
  }
  state.path.pop();
  return schema;
};

export const createSchema = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
  subpath: string[],
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schema = createSchemaObject(zodSchema, state, subpath);
  if (schema.effects) {
    verifyEffects(schema.effects, state);
  }
  return schema.schema;
};
