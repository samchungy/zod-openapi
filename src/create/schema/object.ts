import { oas31 } from 'openapi3-ts';
import { UnknownKeysParam, ZodObject, ZodRawShape } from 'zod';

import { ComponentsObject, createComponentSchemaRef } from '../components';

import { createSchemaOrRef } from '.';

export const createObjectSchema = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
>(
  zodObject: ZodObject<T, UnknownKeys, any, any, any>,
  components: ComponentsObject,
): oas31.SchemaObject => {
  if (zodObject._def.extendMetadata?.extendsRef) {
    return createExtendedSchema(
      zodObject,
      zodObject._def.extendMetadata.extends,
      zodObject._def.extendMetadata.extendsRef,
      components,
    );
  }

  return createObjectSchemaFromShape(
    zodObject.shape,
    zodObject._def.unknownKeys === 'strict',
    components,
  );
};

export const createExtendedSchema = (
  zodObject: ZodObject<any, any, any, any, any>,
  baseZodObject: ZodObject<any, any, any, any, any>,
  schemaRef: string,
  components: ComponentsObject,
): oas31.SchemaObject => {
  const diffShape = createShapeDiff(
    baseZodObject._def.shape() as ZodRawShape,
    zodObject._def.shape() as ZodRawShape,
  );

  return {
    allOf: [
      { $ref: createComponentSchemaRef(schemaRef) },
      createObjectSchemaFromShape(diffShape, false, components),
    ],
  };
};

const createShapeDiff = (
  baseObj: ZodRawShape,
  extendedObj: ZodRawShape,
): ZodRawShape =>
  Object.entries(extendedObj).reduce<ZodRawShape>((acc, [key, val]) => {
    if (val !== baseObj[key]) {
      acc[key as keyof oas31.SchemaObject] = extendedObj[key];
    }

    return acc;
  }, {});

export const createObjectSchemaFromShape = (
  shape: ZodRawShape,
  strict: boolean,
  components: ComponentsObject,
): oas31.SchemaObject => ({
  type: 'object',
  properties: mapProperties(shape, components),
  required: mapRequired(shape),
  ...(strict && { additionalProperties: strict }),
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
  components: ComponentsObject,
): oas31.SchemaObject['properties'] =>
  Object.entries(shape).reduce<NonNullable<oas31.SchemaObject['properties']>>(
    (acc, [key, zodSchema]): NonNullable<oas31.SchemaObject['properties']> => {
      acc[key] = createSchemaOrRef(zodSchema, components);
      return acc;
    },
    {},
  );
