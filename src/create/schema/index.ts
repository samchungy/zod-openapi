import { type core, toJSONSchema } from 'zod/v4';

import type { oas31 } from '../..';

import { getDiscriminatorValue } from './v4/parsers/discriminatedUnion';

export const mapDiscriminator = (
  schemas: oas31.SchemaObject[],
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
      if (state.documentOptions?.enforceDiscriminatedUnionComponents) {
        throw new Error(
          `Discriminated Union member ${index} at ${state.path.join(' > ')} is not registered as a component`,
        );
      }
      return undefined;
    }

    const value = (zodObject.shape as ZodRawShape)[discriminator];

    const literals = unwrapLiterals(value, state);

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

export const clearSchema = (schema: core.JSONSchema.BaseSchema) => {
  // eslint-disable-next-line guard-for-in
  for (const key in schema) {
    delete schema[key];
  }
};

export const createSchema = (
  schema: core.$ZodType,
  state: SchemaState,
  subpath: string[],
): oas31.SchemaObject | oas31.ReferenceObject => {
  const jsonSchema = toJSONSchema(schema, {
    override(ctx) {
      const def = (ctx.zodSchema as core.$ZodTypes)._zod.def;
      switch (def.type) {
        case 'union': {
          // FIXME: https://github.com/colinhacks/zod/pull/4518
          if ('discriminator' in def && typeof def.discriminator === 'string') {
            const oneOf = ctx.jsonSchema.anyOf;
            clearSchema(ctx.jsonSchema);

            ctx.jsonSchema.oneOf = oneOf;
            ctx.jsonSchema.type = 'object';
            ctx.jsonSchema.discriminator = { propertyName: def.discriminator };

            const mapping: NonNullable<oas31.DiscriminatorObject['mapping']> =
              {};
            for (const obj of ctx.jsonSchema
              .oneOf as core.JSONSchema.BaseSchema[]) {
              const ref = obj.$ref;

              if (!ref) {
                return;
              }

              const discriminatorValue = getDiscriminatorValue(
                def.discriminator,
                obj as core.JSONSchema.Schema,
              );

              // Discriminator uses a non string value, avoid creating a mapping altogether
              if (!discriminatorValue) {
                return;
              }

              for (const value of discriminatorValue) {
                mapping[value] = ref;
              }
            }
          }
        }
      }
    },
  });

  delete jsonSchema.$schema;

  return jsonSchema as oas31.SchemaObject;
};
