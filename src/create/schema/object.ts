import { UnknownKeysParam, ZodObject, ZodRawShape } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';
import { createComponentSchemaRef } from '../components';

import { SchemaState, createSchemaOrRef } from '.';

export const createObjectSchema = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
>(
  zodObject: ZodObject<T, UnknownKeys, any, any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  if (zodObject._def.extendMetadata?.extends) {
    return createExtendedSchema(
      zodObject,
      zodObject._def.extendMetadata?.extends,
      state,
    );
  }

  return createObjectSchemaFromShape(
    zodObject.shape,
    zodObject._def.unknownKeys === 'strict',
    state,
  );
};

export const createExtendedSchema = (
  zodObject: ZodObject<any, any, any, any, any>,
  baseZodObject: ZodObject<any, any, any, any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const component = state.components.schemas.get(baseZodObject);
  if (component || baseZodObject._def.openapi?.ref) {
    createSchemaOrRef(baseZodObject, state);
  }

  const completeComponent = state.components.schemas.get(baseZodObject);
  if (!completeComponent) {
    return createObjectSchemaFromShape(
      zodObject._def.shape() as ZodRawShape,
      zodObject._def.unknownKeys === 'strict',
      state,
    );
  }

  const diffShape = createShapeDiff(
    baseZodObject._def.shape() as ZodRawShape,
    zodObject._def.shape() as ZodRawShape,
  );

  if (!diffShape) {
    return createObjectSchemaFromShape(
      zodObject._def.shape() as ZodRawShape,
      zodObject._def.unknownKeys === 'strict',
      state,
    );
  }

  return {
    allOf: [
      { $ref: createComponentSchemaRef(completeComponent.ref) },
      createObjectSchemaFromShape(diffShape, false, state),
    ],
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
      acc[key] = extendedObj[key];
      continue;
    }

    return null;
  }

  return acc;
};

export const createObjectSchemaFromShape = (
  shape: ZodRawShape,
  strict: boolean,
  state: SchemaState,
): oas31.SchemaObject => ({
  type: 'object',
  properties: mapProperties(shape, state),
  required: mapRequired(shape),
  ...(strict && { additionalProperties: false }),
});

export const mapRequired = (
  shape: ZodRawShape,
): oas31.SchemaObject['required'] => {
  const required: string[] = Object.entries(shape)
    .filter(([_key, zodSchema]) => !zodSchema.isOptional())
    .map(([key]) => key);

  if (!required.length) {
    return undefined;
  }

  return required;
};

export const mapProperties = (
  shape: ZodRawShape,
  state: SchemaState,
): oas31.SchemaObject['properties'] =>
  Object.entries(shape).reduce<NonNullable<oas31.SchemaObject['properties']>>(
    (acc, [key, zodSchema]): NonNullable<oas31.SchemaObject['properties']> => {
      acc[key] = createSchemaOrRef(zodSchema, state);
      return acc;
    },
    {},
  );
