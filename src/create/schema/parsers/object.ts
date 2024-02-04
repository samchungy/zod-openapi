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
import { createComponentSchemaRef } from '../../components';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { isOptionalSchema } from './optional';
import { resolveEffect } from './transform';

export const createObjectSchema = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
  Catchall extends ZodTypeAny = ZodTypeAny,
  Output = objectOutputType<T, Catchall, UnknownKeys>,
  Input = objectInputType<T, Catchall, UnknownKeys>,
>(
  zodObject: ZodObject<T, UnknownKeys, Catchall, Output, Input>,
  state: SchemaState,
): Schema => {
  const extendedSchema = createExtendedSchema(
    zodObject,
    zodObject._def.extendMetadata?.extends,
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
  if (component ?? baseZodObject._def.openapi?.ref) {
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
  );

  return {
    type: 'schema',
    schema: {
      allOf: [{ $ref: createComponentSchemaRef(completeComponent.ref) }],
      ...extendedSchema.schema,
    },
    effect: resolveEffect([
      {
        path: [...state.path],
        zodType: baseZodObject,
        // TODO: Check this
        type:
          completeComponent.type === 'complete'
            ? completeComponent.creationType
            : undefined,
      },
      extendedSchema.effect,
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
): Schema => {
  const properties = mapProperties(shape, state);
  const required = mapRequired(shape, state);
  const additionalProperties = !isZodType(catchAll, 'ZodNever')
    ? createSchemaObject(catchAll, state, ['additional properties'])
    : undefined;

  return {
    type: 'schema',
    schema: {
      type: 'object',
      ...(properties && { properties: properties.properties }),
      ...(required && { required }),
      ...(unknownKeys === 'strict' && { additionalProperties: false }),
      ...(additionalProperties && {
        additionalProperties: additionalProperties.schema,
      }),
    },
    effect: resolveEffect([
      ...(properties?.effects ?? []),
      additionalProperties?.effect,
    ]),
  };
};

export const mapRequired = (
  shape: ZodRawShape,
  state: SchemaState,
): oas31.SchemaObject['required'] => {
  const required: string[] = Object.entries(shape)
    .filter(([_key, zodSchema]) => !isOptionalSchema(zodSchema, state))
    .map(([key]) => key);

  if (!required.length) {
    return undefined;
  }

  return required;
};

interface PropertyMap {
  properties: NonNullable<oas31.SchemaObject['properties']>;
  effects: Array<Schema['effect']>;
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
      if (
        isZodType(zodSchema, 'ZodNever') ||
        isZodType(zodSchema, 'ZodUndefined')
      ) {
        return acc;
      }

      const property = createSchemaObject(zodSchema, state, [
        `property: ${key}`,
      ]);

      acc.properties[key] = property.schema;
      acc.effects.push(property.effect);
      return acc;
    },
    {
      properties: {},
      effects: [],
    } as PropertyMap,
  );
};
