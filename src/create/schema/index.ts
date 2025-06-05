import { create } from 'domain';

import {
  type GlobalMeta,
  type core,
  globalRegistry,
  registry,
  toJSONSchema,
} from 'zod/v4';

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

export const createHash = (jsonSchema: core.JSONSchema.BaseSchema): string => {
  // Create a simple number hash based on the JSON schema properties
  let hash = 0;
  const jsonString = JSON.stringify(jsonSchema);
  for (let i = 0; i < jsonString.length; i++) {
    hash = (hash << 5) - hash + jsonString.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  return hash.toString(16);
};

export const clearSchema = (schema: core.JSONSchema.BaseSchema) => {
  // eslint-disable-next-line guard-for-in
  for (const key in schema) {
    delete schema[key];
  }
};

type Override = NonNullable<
  NonNullable<Parameters<typeof toJSONSchema>[1]>['override']
>;

type ZodTypeWithMeta = Parameters<Override>[0]['zodSchema'] & {
  meta: () => GlobalMeta | undefined;
};

const override: Override = (ctx) => {
  const def = ctx.zodSchema._zod.def;
  switch (def.type) {
    case 'literal': {
      if (ctx.jsonSchema.const) {
        const type = typeof ctx.jsonSchema.const;
        if (ctx.jsonSchema.const !== undefined) {
          ctx.jsonSchema.type = type;
        }
      }
      break;
    }
    case 'bigint': {
      ctx.jsonSchema.type = 'integer';
      ctx.jsonSchema.format = 'int64';
      break;
    }
    case 'date': {
      ctx.jsonSchema.type = 'string';
      break;
    }
    case 'union': {
      // FIXME: https://github.com/colinhacks/zod/pull/4518
      if ('discriminator' in def && typeof def.discriminator === 'string') {
        ctx.jsonSchema.oneOf = ctx.jsonSchema.anyOf;
        delete ctx.jsonSchema.anyOf;

        ctx.jsonSchema.type = 'object';
        ctx.jsonSchema.discriminator = {
          propertyName: def.discriminator,
        } as oas31.DiscriminatorObject;

        const mapping: NonNullable<oas31.DiscriminatorObject['mapping']> = {};
        for (const [index, obj] of Object.entries(
          ctx.jsonSchema.oneOf as core.JSONSchema.BaseSchema[],
        )) {
          const ref = obj.$ref;

          if (!ref) {
            return;
          }

          const discriminatorValues = (
            def.options[Number(index)] as core.$ZodObject
          )._zod.propValues[def.discriminator];

          for (const value of [...(discriminatorValues ?? [])]) {
            if (typeof value !== 'string') {
              return;
            }
            mapping[value] = ref;
          }
        }

        (ctx.jsonSchema.discriminator as oas31.DiscriminatorObject).mapping =
          mapping;
      }

      const meta = (ctx.zodSchema as ZodTypeWithMeta).meta();

      if (typeof meta?.unionOneOf === 'boolean') {
        if (meta.unionOneOf) {
          ctx.jsonSchema.oneOf = ctx.jsonSchema.anyOf;
          delete ctx.jsonSchema.anyOf;
        }
        delete ctx.jsonSchema.unionOneOf;
      }
    }
  }
};

export const createSchema = (
  schema: core.$ZodType,
  state: SchemaState,
  subpath: string[],
): oas31.SchemaObject | oas31.ReferenceObject => {
  const defs = {};
  const jsonSchema = toJSONSchema(schema, {
    override(ctx) {
      const meta = (ctx.zodSchema as ZodTypeWithMeta).meta();
      if (ctx.jsonSchema.$ref) {
        return;
      }

      override(ctx);
      meta?.override?.(ctx);
    },
    external: {
      defs,
      registry: globalRegistry,
      uri: (id: string) => `#/components/schemas/${id}`,
    },
    unrepresentable: 'any',
  });

  delete jsonSchema.$schema;

  return jsonSchema as oas31.SchemaObject;
};
