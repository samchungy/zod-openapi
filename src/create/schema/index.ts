import {
  type GlobalMeta,
  type core,
  globalRegistry,
  registry,
  toJSONSchema,
} from 'zod/v4';

import type { oas31 } from '../..';

type Override = NonNullable<
  NonNullable<Parameters<typeof toJSONSchema>[1]>['override']
>;

type ZodTypeWithMeta = Parameters<Override>[0]['zodSchema'] & {
  meta: () => GlobalMeta | undefined;
};

const override: Override = (ctx) => {
  const def = ctx.zodSchema._zod.def;
  switch (def.type) {
    case 'bigint': {
      ctx.jsonSchema.type = 'integer';
      ctx.jsonSchema.format = 'int64';
      break;
    }
    case 'union': {
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
      break;
    }
    case 'date': {
      ctx.jsonSchema.type = 'string';
      break;
    }
  }
};

export type CreateSchemaOpts = {
  // Our own internal counter for creating unique dynamic component names
  dynamicComponentCounter: number;
  components: Record<string, oas31.SchemaObject>;
  io: 'input' | 'output';
};

export const createSchema = (schema: core.$ZodType, opts: CreateSchemaOpts) => {
  const schemas = {
    createSchema: schema,
  };

  const jsonSchemas = createSchemas(schemas, opts);

  return {
    schema: jsonSchemas.schemas.createSchema,
    components: jsonSchemas.components,
  };
};

export const createSchemas = <T extends Record<string, core.$ZodType>>(
  schemas: T,
  opts: CreateSchemaOpts,
): {
  schemas: Record<keyof T, oas31.SchemaObject | oas31.ReferenceObject>;
  components: Record<string, oas31.SchemaObject>;
} => {
  const schemaRegistry = registry<GlobalMeta>();

  // Schemas may already be registered in the global registry
  // This is required so that the generated schema contains the correct $refs
  // and allows us to map that back to the consumer provided ids.
  const keyIdMap: Record<string, keyof T> = {};
  // Keep tracks of global registry ids so we can determine if a ref is a dynamically generated one
  const idSet = new Set<string>();

  for (const [name, schema] of Object.entries(schemas)) {
    const id = globalRegistry.get(schema)?.id;
    if (id) {
      schemaRegistry.add(schema, { id });
      idSet.add(id);
      keyIdMap[id] = name;
      continue;
    }
    schemaRegistry.add(schema, { id: name });
    keyIdMap[name] = name;
    idSet.add(name);
  }

  // Our schema is recursively referenced but is not named via the schemaX convention
  const customDynamicComponents: Record<string, string> = {};
  const componentsToReplace: Record<string, string> = {};

  const jsonSchema = toJSONSchema(schemaRegistry, {
    override(ctx) {
      const meta = (ctx.zodSchema as ZodTypeWithMeta).meta();
      if (ctx.jsonSchema.$ref) {
        return;
      }

      override(ctx);
      if (typeof meta?.override === 'function') {
        meta.override(ctx);
        delete ctx.jsonSchema.override;
      }
      if (typeof meta?.override === 'object' && meta.override !== null) {
        Object.assign(ctx.jsonSchema, meta.override);
        delete ctx.jsonSchema.override;
      }

      delete ctx.jsonSchema.$schema;
      delete ctx.jsonSchema.id;
    },
    io: opts.io,
    unrepresentable: 'any',
    uri: (id) => {
      if (id !== '__shared' && !idSet.has(id)) {
        const schemaName = `schema${opts.dynamicComponentCounter++}`;
        customDynamicComponents[id] = schemaName;
        componentsToReplace[id] = schemaName;
        return `#components/schemas/__shared#/$defs/${schemaName}`;
      }

      return `#/components/schemas/${id}`;
    },
  });

  for (const value of Object.values(jsonSchema.schemas)) {
    delete value.$schema;
    delete value.id;
  }

  // Re-map our recursively referenced schema
  for (const [key, newKey] of Object.entries(customDynamicComponents)) {
    const value = jsonSchema.schemas[key] as core.JSONSchema.JSONSchema;
    delete jsonSchema.schemas[key];
    jsonSchema.schemas[newKey] = value;
    keyIdMap[key] = newKey;
  }

  const sharedDefs = jsonSchema.schemas.__shared?.$defs ?? {};

  for (const [key, value] of Object.entries(sharedDefs)) {
    // dynamic schema
    if (/^schema\d+$/.exec(key)) {
      const componentName = `__schema${opts.dynamicComponentCounter++}`;
      componentsToReplace[key] = componentName;
      delete sharedDefs[key];
      sharedDefs[componentName] = value;
      continue;
    }
    componentsToReplace[key] = key;
  }

  const patched = JSON.stringify(jsonSchema).replace(
    /"#\/components\/schemas\/__shared#\/\$defs\/([^"]+)"/g,
    (_, p1: string) => {
      // If the value is a dynamic component, replace it with the component name
      const component = componentsToReplace[p1];
      if (!component) {
        throw new Error(`Component not found for ${p1}`);
      }
      return `"#/components/schemas/${component}"`;
    },
  );

  const patchedJsonSchema = JSON.parse(patched) as typeof jsonSchema;

  const components = patchedJsonSchema.schemas.__shared?.$defs ?? {};
  delete patchedJsonSchema.schemas.__shared;

  for (const [key, value] of Object.entries(patchedJsonSchema.schemas)) {
    const mappedKey = keyIdMap[key] as string | undefined;

    if (!mappedKey) {
      throw new Error(`Mapped key not found for ${key}`);
    }

    // This is actually a component
    if (mappedKey !== key) {
      components[mappedKey] = value;
      patchedJsonSchema.schemas[mappedKey] = {
        $ref: `#/components/schemas/${mappedKey}`,
      };
      delete patchedJsonSchema.schemas[key];
      continue;
    }
  }

  return {
    schemas: patchedJsonSchema.schemas as Record<
      keyof T,
      oas31.SchemaObject | oas31.ReferenceObject
    >,
    components: components as Record<string, oas31.SchemaObject>,
  };
};
