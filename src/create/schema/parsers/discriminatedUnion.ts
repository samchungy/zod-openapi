import type {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodLiteralDef,
  ZodRawShape,
} from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createDiscriminatedUnionSchema = (
  zodDiscriminatedUnion: ZodDiscriminatedUnion<any, any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const options = zodDiscriminatedUnion.options as AnyZodObject[];
  const schemas = options.map((option, index) =>
    createSchemaObject(option, state, [`discriminated union option ${index}`]),
  );
  const discriminator = mapDiscriminator(
    schemas,
    options,
    zodDiscriminatedUnion.discriminator,
    state,
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
  state: SchemaState,
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
