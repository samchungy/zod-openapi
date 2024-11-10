import type {
  UnknownKeysParam,
  ZodObject,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
  objectInputType,
  objectOutputType,
} from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import { type Effect, createComponentSchemaRef } from '../../components';
import {
  type RefObject,
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';
import { createDescriptionMetadata } from '../metadata';

import { isOptionalObjectKey } from './optional';
import { flattenEffects } from './transform';

export const createObjectSchema = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>,
>(
  zodObject: ZodObject<T, UnknownKeys, Catchall, Output, Input>,
  previous: RefObject | undefined,
  state: SchemaState,
): Schema => {
  const extendedSchema = createExtendedSchema(
    zodObject,
    previous?.zodType as ZodObject<T, UnknownKeys, Catchall, Output, Input>,
    state,
  );

  if (extendedSchema) {
    return extendedSchema;
  }

  return createObjectSchemaFromShape(
    zodObject.shape,
    {
      unknownKeys: zodObject._def.unknownKeys,
      catchAll: zodObject._def.catchall as ZodType,
    },
    state,
  );
};

export const createExtendedSchema = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>,
>(
  zodObject: ZodObject<T, UnknownKeys, Catchall, Output, Input>,
  baseZodObject: ZodObject<T, UnknownKeys, Catchall, Output, Input> | undefined,
  state: SchemaState,
): Schema | undefined => {
  if (!baseZodObject) {
    return undefined;
  }

  const component = state.components.schemas.get(baseZodObject);
  if (component ?? baseZodObject._def.zodOpenApi?.openapi?.ref) {
    createSchemaObject(baseZodObject, state, ['extended schema']);
  }

  const completeComponent = state.components.schemas.get(baseZodObject);
  if (!completeComponent) {
    return undefined;
  }

  const diffOpts = createDiffOpts(
    {
      unknownKeys: baseZodObject._def.unknownKeys,
      catchAll: baseZodObject._def.catchall as ZodType,
    },
    {
      unknownKeys: zodObject._def.unknownKeys,
      catchAll: zodObject._def.catchall as ZodType,
    },
  );
  if (!diffOpts) {
    return undefined;
  }

  const diffShape = createShapeDiff(
    baseZodObject._def.shape() as ZodRawShape,
    zodObject._def.shape() as ZodRawShape,
  );

  if (!diffShape) {
    return undefined;
  }

  const extendedSchema = createObjectSchemaFromShape(
    diffShape,
    diffOpts,
    state,
    true,
  );

  const schemaLength = Object.keys(extendedSchema.schema).length;
  const effects = flattenEffects([
    completeComponent.type === 'complete' ? completeComponent.effects : [],
    completeComponent.type === 'in-progress'
      ? [
          {
            type: 'component',
            zodType: zodObject,
            path: [...state.path],
          },
        ]
      : [],
    extendedSchema.effects,
  ]);

  if (schemaLength === 0) {
    return {
      type: 'ref',
      schema: {
        $ref: createComponentSchemaRef(
          completeComponent.ref,
          state.documentOptions?.componentRefPath,
        ),
      },
      schemaObject:
        completeComponent.type === 'complete'
          ? completeComponent.schemaObject
          : undefined,
      zodType: zodObject,
      effects,
    };
  }

  if (schemaLength === 1 && extendedSchema.schema.description) {
    return createDescriptionMetadata(
      {
        type: 'ref',
        schema: {
          $ref: createComponentSchemaRef(
            completeComponent.ref,
            state.documentOptions?.componentRefPath,
          ),
        },
        schemaObject:
          completeComponent.type === 'complete'
            ? completeComponent.schemaObject
            : undefined,
        zodType: zodObject,
        effects,
      },
      extendedSchema.schema.description,
      state,
    );
  }

  return {
    type: 'schema',
    schema: {
      allOf: [
        {
          $ref: createComponentSchemaRef(
            completeComponent.ref,
            state.documentOptions?.componentRefPath,
          ),
        },
      ],
      ...extendedSchema.schema,
    },
    effects: flattenEffects([
      completeComponent.type === 'complete' ? completeComponent.effects : [],
      completeComponent.type === 'in-progress'
        ? [
            {
              type: 'component',
              zodType: zodObject,
              path: [...state.path],
            },
          ]
        : [],
      extendedSchema.effects,
    ]),
  };
};

const createDiffOpts = (
  baseOpts: AdditionalPropertyOptions,
  extendedOpts: AdditionalPropertyOptions,
): AdditionalPropertyOptions | undefined => {
  if (
    baseOpts.unknownKeys === 'strict' ||
    !isZodType(baseOpts.catchAll, 'ZodNever')
  ) {
    return undefined;
  }

  return {
    catchAll: extendedOpts.catchAll,
    unknownKeys: extendedOpts.unknownKeys,
  };
};

const createShapeDiff = (
  baseObj: ZodRawShape,
  extendedObj: ZodRawShape,
): ZodRawShape | null => {
  const acc: ZodRawShape = {};

  for (const [key, val] of Object.entries(extendedObj)) {
    const baseValue = baseObj[key];
    if (val === baseValue) {
      continue;
    }

    if (baseValue === undefined) {
      acc[key] = extendedObj[key] as ZodTypeAny;
      continue;
    }

    return null;
  }

  return acc;
};

interface AdditionalPropertyOptions {
  unknownKeys?: UnknownKeysParam;
  catchAll: ZodType;
}

export const createObjectSchemaFromShape = (
  shape: ZodRawShape,
  { unknownKeys, catchAll }: AdditionalPropertyOptions,
  state: SchemaState,
  omitType?: boolean,
): Schema => {
  const properties = mapProperties(shape, state);
  const required = mapRequired(properties, shape, state);
  const additionalProperties = !isZodType(catchAll, 'ZodNever')
    ? createSchemaObject(catchAll, state, ['additional properties'])
    : undefined;

  return {
    type: 'schema',
    schema: {
      ...(!omitType && { type: 'object' }),
      ...(properties && { properties: properties.properties }),
      ...(required?.required.length && { required: required.required }),
      ...(unknownKeys === 'strict' && { additionalProperties: false }),
      ...(additionalProperties && {
        additionalProperties: additionalProperties.schema,
      }),
    },
    effects: flattenEffects([
      ...(properties?.effects ?? []),
      additionalProperties?.effects,
      required?.effects,
    ]),
  };
};

export const mapRequired = (
  properties: PropertyMap | undefined,
  shape: ZodRawShape,
  state: SchemaState,
): { required: string[]; effects?: Effect[] } | undefined => {
  if (!properties) {
    return undefined;
  }

  const { required, effects } = Object.entries(properties.schemas).reduce<{
    required: string[];
    effects: Effect[];
  }>(
    (acc, [key, schemaOrRef]) => {
      const zodSchema = shape[key];
      if (!zodSchema) {
        throw new Error("Property somehow doesn't exist in shape");
      }

      const result = zodSchema.safeParse(undefined);

      if (!result.success) {
        acc.required.push(key);
        return acc;
      }

      // Defaulted to a value
      if (result.data !== undefined) {
        const baseEffect: Pick<Effect, 'zodType' | 'path'> = {
          zodType: zodSchema as ZodType,
          path: [...state.path, `property: ${key}`],
        };

        const effect: Effect =
          schemaOrRef.type === 'ref'
            ? {
                ...baseEffect,
                type: 'component',
              }
            : {
                ...baseEffect,
                type: 'schema',
                creationType: state.type,
              };

        acc.effects.push(effect);

        if (state.type === 'output') {
          acc.required.push(key);
        }
      }

      return acc;
    },
    {
      required: [],
      effects: [],
    },
  );

  return { required, effects };
};

interface PropertyMap {
  schemas: Record<string, Schema>;
  properties: NonNullable<oas31.SchemaObject['properties']>;
  effects: Array<Effect[] | undefined>;
}

export const mapProperties = (
  shape: ZodRawShape,
  state: SchemaState,
): PropertyMap | undefined => {
  const shapeEntries = Object.entries(shape);

  if (!shapeEntries.length) {
    return undefined;
  }
  return shapeEntries.reduce(
    (acc, [key, zodSchema]) => {
      if (isOptionalObjectKey(zodSchema)) {
        return acc;
      }

      const schema = createSchemaObject(zodSchema, state, [`property: ${key}`]);

      acc.schemas[key] = schema;
      acc.properties[key] = schema.schema;
      acc.effects.push(schema.effects);
      return acc;
    },
    {
      schemas: {},
      properties: {},
      effects: [],
    } as PropertyMap,
  );
};
