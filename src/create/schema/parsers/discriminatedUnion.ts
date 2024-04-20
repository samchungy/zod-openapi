import type {
  AnyZodObject,
  ZodDiscriminatedUnion,
  ZodDiscriminatedUnionOption,
  ZodRawShape,
  ZodType,
  ZodTypeAny,
} from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { flattenEffects } from './transform';

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
  );
  return {
    type: 'schema',
    schema: {
      oneOf: schemaObjects,
      ...(discriminator && { discriminator }),
    },
    effects: flattenEffects(schemas.map((schema) => schema.effects)),
  };
};

const unwrapLiterals = (
  zodType: ZodType | ZodTypeAny | undefined,
): string[] | undefined => {
  if (isZodType(zodType, 'ZodLiteral')) {
    if (typeof zodType._def.value !== 'string') {
      return undefined;
    }
    return [zodType._def.value];
  }

  if (isZodType(zodType, 'ZodEnum')) {
    return zodType._def.values;
  }

  if (isZodType(zodType, 'ZodBranded')) {
    return unwrapLiterals(zodType._def.type);
  }

  if (isZodType(zodType, 'ZodReadonly')) {
    return unwrapLiterals(zodType._def.innerType);
  }

  if (isZodType(zodType, 'ZodCatch')) {
    return unwrapLiterals(zodType._def.innerType);
  }

  return undefined;
};

export const mapDiscriminator = (
  schemas: Array<oas31.SchemaObject | oas31.ReferenceObject>,
  zodObjects: AnyZodObject[],
  discriminator: unknown,
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

    const literals = unwrapLiterals(value);

    if (!literals) {
      return undefined;
    }

    for (const enumValue of literals) {
      mapping[enumValue] = componentSchemaRef;
    }
  }

  return {
    propertyName: discriminator,
    mapping,
  };
};
