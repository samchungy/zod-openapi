import { oas31 } from 'openapi3-ts';
import {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodEnum,
  ZodLiteralDef,
  ZodRawShape,
} from 'zod';

import { createComponentSchemaRef } from '../components';

import { SchemaState, createSchemaOrRef } from '.';

export const createDiscriminatedUnionSchema = (
  zodDiscriminatedUnion: ZodDiscriminatedUnion<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const options = zodDiscriminatedUnion.options as AnyZodObject[];
  const schemas = options.map((option) => createSchemaOrRef(option, state));
  const discriminator = mapDiscriminator(
    options,
    zodDiscriminatedUnion.discriminator as string,
  );
  return {
    oneOf: schemas,
    ...(discriminator && { discriminator }),
  };
};

export const mapDiscriminator = (
  zodObjects: AnyZodObject[],
  discriminator: string,
) => {
  if (zodObjects.some((obj) => !obj._def.openapi?.ref)) {
    return undefined;
  }

  const mapping = zodObjects.reduce<
    NonNullable<oas31.DiscriminatorObject['mapping']>
  >((acc, zodObject) => {
    const schemaRef = zodObject._def.openapi?.ref as string;
    const value = (zodObject.shape as ZodRawShape)[discriminator];

    if (value instanceof ZodEnum) {
      for (const enumValue of value._def.values as string[]) {
        acc[enumValue] = createComponentSchemaRef(schemaRef);
      }
      return acc;
    }

    const literalValue = (value?._def as ZodLiteralDef<unknown>).value;

    if (typeof literalValue !== 'string') {
      throw new Error(
        `Discriminator ${discriminator} could not be found in one of the values of a discriminated union`,
      );
    }

    acc[literalValue] = createComponentSchemaRef(schemaRef);
    return acc;
  }, {});

  return {
    propertyName: discriminator,
    mapping,
  };
};
