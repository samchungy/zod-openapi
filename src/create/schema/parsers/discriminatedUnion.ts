import type {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodDiscriminatedUnionOption,
  ZodLiteralDef,
  ZodRawShape,
} from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { resolveEffect } from './transform';

export const createDiscriminatedUnionSchema = <
  Discriminator extends string,
  Options extends Array<ZodDiscriminatedUnionOption<Discriminator>>,
>(
  zodDiscriminatedUnion: ZodDiscriminatedUnion<Discriminator, Options>,
  state: SchemaState,
): Schema => {
  const options = zodDiscriminatedUnion.options;
  const schemas = options.map((option, index) =>
    createSchemaObject(option, state, [`discriminated union option ${index}`]),
  );
  const schemaObjects = schemas.map((schema) => schema.schema);
  const discriminator = mapDiscriminator(
    schemaObjects,
    options,
    zodDiscriminatedUnion.discriminator,
    state,
  );
  return {
    type: 'schema',
    schema: {
      oneOf: schemaObjects,
      ...(discriminator && { discriminator }),
    },
    effect: resolveEffect(schemas.map((schema) => schema.effect)),
  };
};

export const mapDiscriminator = (
  schemas: Array<oas31.SchemaObject | oas31.ReferenceObject>,
  zodObjects: AnyZodObject[],
  discriminator: unknown,
  state: SchemaState,
): oas31.SchemaObject['discriminator'] => {
  if (typeof discriminator !== 'string') {
    return undefined;
  }

  const mapping: NonNullable<oas31.DiscriminatorObject['mapping']> = {};
  for (const [index, zodObject] of zodObjects.entries()) {
    const schema = schemas[index] as oas31.SchemaObject | oas31.ReferenceObject;
    const componentSchemaRef = '$ref' in schema ? schema?.$ref : undefined;
    if (!componentSchemaRef) {
      return undefined;
    }

    const value = (zodObject.shape as ZodRawShape)[discriminator];

    if (isZodType(value, 'ZodEnum')) {
      for (const enumValue of value._def.values as string[]) {
        mapping[enumValue] = componentSchemaRef;
      }
      continue;
    }

    const literalValue = (value?._def as ZodLiteralDef<unknown>).value;

    if (typeof literalValue !== 'string') {
      throw new Error(
        `Discriminator ${discriminator} could not be found in on index ${index} of a discriminated union at ${state.path.join(
          ' > ',
        )}`,
      );
    }

    mapping[literalValue] = componentSchemaRef;
  }

  return {
    propertyName: discriminator,
    mapping,
  };
};
