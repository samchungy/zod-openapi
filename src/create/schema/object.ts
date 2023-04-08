import { oas31 } from 'openapi3-ts';
import { UnknownKeysParam, ZodObject, ZodRawShape } from 'zod';

import { createSchemaOrRef } from './schema';

export const createObjectSchema = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
>(
  zodObject: ZodObject<T, UnknownKeys, any, any, any>,
): oas31.SchemaObject => ({
  type: 'object',
  properties: mapProperties(zodObject),
  required: mapRequired(zodObject),
  additionalProperties: mapAdditionalProperties(zodObject),
});

const mapAdditionalProperties = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
>(
  zodObject: ZodObject<T, UnknownKeys, any, any, any>,
): oas31.SchemaObject['additionalProperties'] =>
  zodObject._def.unknownKeys !== 'strict';

const mapRequired = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
>(
  zodObject: ZodObject<T, UnknownKeys, any, any, any>,
): oas31.SchemaObject['required'] => {
  const required: string[] = Object.entries(zodObject.shape)
    .filter(([_key, zodSchema]) => !zodSchema.isOptional())
    .map(([key]) => key);

  if (!required.length) {
    return undefined;
  }

  return required;
};

const mapProperties = <
  T extends ZodRawShape,
  UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
>(
  zodObject: ZodObject<T, UnknownKeys, any, any, any>,
): oas31.SchemaObject['properties'] =>
  Object.entries(zodObject.shape).reduce<
    NonNullable<oas31.SchemaObject['properties']>
  >((acc, [key, zodSchema]): NonNullable<oas31.SchemaObject['properties']> => {
    acc[key] = createSchemaOrRef(zodSchema);
    return acc;
  }, {});
