import {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodEnum,
  ZodLiteralDef,
  ZodRawShape,
} from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

import { SchemaState, createSchemaOrRef } from '.';

export const createDiscriminatedUnionSchema = (
  zodDiscriminatedUnion: ZodDiscriminatedUnion<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const options = zodDiscriminatedUnion.options as AnyZodObject[];
  const schemas = options.map((option) => createSchemaOrRef(option, state));
  const discriminator = mapDiscriminator(
    schemas,
    options,
    zodDiscriminatedUnion.discriminator,
  );
  return {
    oneOf: schemas,
    ...(discriminator && { discriminator }),
  };
};

export const mapDiscriminator = (
  schemas: (oas31.SchemaObject | oas31.ReferenceObject)[],
  zodObjects: AnyZodObject[],
  discriminator: unknown,
): oas31.SchemaObject['discriminator'] => {
  if (typeof discriminator !== 'string') {
    return undefined;
  }

  const mapping: NonNullable<oas31.DiscriminatorObject['mapping']> = {};
  for (const [index, zodObject] of zodObjects.entries()) {
    const schema = schemas[index];
    const componentSchemaRef = '$ref' in schema ? schema?.$ref : undefined;
    if (!componentSchemaRef) {
      return undefined;
    }

    const value = (zodObject.shape as ZodRawShape)[discriminator];

    if (value instanceof ZodEnum) {
      for (const enumValue of value._def.values as string[]) {
        mapping[enumValue] = componentSchemaRef;
      }
      continue;
    }

    const literalValue = (value?._def as ZodLiteralDef<unknown>).value;

    if (typeof literalValue !== 'string') {
      throw new Error(
        `Discriminator ${discriminator} could not be found in one of the values of a discriminated union`,
      );
    }

    mapping[literalValue] = componentSchemaRef;
  }

  return {
    propertyName: discriminator,
    mapping,
  };
};
