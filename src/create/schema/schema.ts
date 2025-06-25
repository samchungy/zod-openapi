import {
  type GlobalMeta,
  type core,
  globalRegistry,
  toJSONSchema,
  registry as zodRegistry,
} from 'zod/v4';

import type { CreateDocumentOptions, Override, oas31 } from '../..';
import { type ComponentRegistry, createRegistry } from '../components';

type ZodTypeWithMeta = core.$ZodTypes & {
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

          if (!discriminatorValues?.size) {
            return;
          }

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
    case 'literal': {
      if (def.values.includes(undefined)) {
        break;
      }
      break;
    }
  }
};

const validate: Override = (ctx) => {
  if (Object.keys(ctx.jsonSchema).length) {
    return;
  }

  const def = ctx.zodSchema._zod.def;
  switch (def.type) {
    case 'any': {
      break;
    }
    case 'unknown': {
      break;
    }
    case 'pipe': {
      if (ctx.io === 'output') {
        // For some reason transform calls pipe and the meta ends up on the pipe instead of the transform
        throw new Error(
          'Zod transform schemas are not supported in output schemas. Please use `.overwrite()` or wrap the schema in a `.pipe()`',
        );
      }
      break;
    }
    case 'literal': {
      if (def.values.includes(undefined)) {
        throw new Error(
          'Zod literal schemas cannot include `undefined` as a value. Please use `z.undefined()` or `.optional()` instead.',
        );
      }
      break;
    }
  }
};

const deleteZodOpenApiMeta = (jsonSchema: core.JSONSchema.JSONSchema) => {
  delete jsonSchema.param;
  delete jsonSchema.header;
  delete jsonSchema.unusedIO;
  delete jsonSchema.override;
  delete jsonSchema.outputId;
};

export interface CreateSchemaResult {
  schema: oas31.SchemaObject | oas31.ReferenceObject;
  components: Record<string, oas31.SchemaObject>;
}

export const createSchema = (
  schema: core.$ZodType,
  ctx: {
    registry?: ComponentRegistry;
    io?: 'input' | 'output';
    opts?: CreateDocumentOptions;
  } = {
    registry: createRegistry(),
    io: 'output',
    opts: {},
  },
) => {
  ctx.registry ??= createRegistry();
  ctx.opts ??= {};
  ctx.io ??= 'output';

  const registrySchemas = Object.fromEntries(
    ctx.registry.schemas[ctx.io].schemas,
  );
  const schemas = {
    zodOpenApiCreateSchema: { zodType: schema },
  };
  Object.assign(schemas, registrySchemas);

  const jsonSchemas = createSchemas(schemas, {
    registry: ctx.registry,
    io: ctx.io,
    opts: ctx.opts,
  });

  return {
    schema: jsonSchemas.schemas.zodOpenApiCreateSchema,
    components: jsonSchemas.components,
  };
};

export const createSchemas = <
  T extends Record<string, { zodType: core.$ZodType }>,
>(
  schemas: T,
  {
    registry,
    io,
    opts,
  }: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
    opts: CreateDocumentOptions;
  },
): {
  schemas: Record<keyof T, oas31.SchemaObject | oas31.ReferenceObject>;
  components: Record<string, oas31.SchemaObject>;
} => {
  const schemaRegistry = zodRegistry<GlobalMeta>();
  const globalsInSchemas = new Map<string, string>();

  for (const [name, { zodType }] of Object.entries(schemas)) {
    const id = globalRegistry.get(zodType)?.id;
    if (id) {
      globalsInSchemas.set(name, id);
    }

    schemaRegistry.add(zodType, { id: name });
  }

  const outputIds = new Map<string, string>();
  const jsonSchema = toJSONSchema(schemaRegistry, {
    override(ctx) {
      const meta = (ctx.zodSchema as ZodTypeWithMeta).meta();
      if (meta?.outputId && meta?.id) {
        // If the schema has an outputId, we need to replace it later
        outputIds.set(meta.id, meta.outputId);
      }

      if (ctx.jsonSchema.$ref) {
        return;
      }

      const enrichedContext = { ...ctx, io };

      override(enrichedContext);
      if (typeof opts.override === 'function') {
        opts.override(enrichedContext);
      }
      if (typeof meta?.override === 'function') {
        meta.override(enrichedContext);
        delete ctx.jsonSchema.override;
      }
      if (typeof meta?.override === 'object' && meta.override !== null) {
        Object.assign(ctx.jsonSchema, meta.override);
        delete ctx.jsonSchema.override;
      }

      delete ctx.jsonSchema.$schema;
      delete ctx.jsonSchema.id;
      deleteZodOpenApiMeta(ctx.jsonSchema);

      validate(enrichedContext);
    },
    io,
    unrepresentable: 'any',
    uri: (id) => `#/components/schemas/${id}`,
  });

  const sharedDefs = jsonSchema.schemas.__shared?.$defs ?? {};

  const componentsToReplace = new Map<string, string>();
  for (const [key, value] of Object.entries(sharedDefs)) {
    // If the key is a Zod dynamic schema, replace it with our own component name
    if (/^schema\d+$/.exec(key)) {
      const componentName = `__schema${registry.schemas.dynamicSchemaCount++}`;
      componentsToReplace.set(`__shared#/$defs/${key}`, componentName);
      delete sharedDefs[key];
      sharedDefs[componentName] = value;
      continue;
    }

    componentsToReplace.set(`__shared#/$defs/${key}`, key);
  }

  for (const value of Object.values(jsonSchema.schemas)) {
    delete value.$schema;
    delete value.id;
  }

  const dynamicComponent = new Map<string, string>();
  const patched = JSON.stringify(jsonSchema).replace(
    /"#\/components\/schemas\/([^"]+)"/g,
    (_, match: string) => {
      // If the value is a dynamic component, replace it with the component name
      const replacement = componentsToReplace.get(match);
      if (replacement) {
        return `"#/components/schemas/${replacement}"`;
      }

      const component = registry.schemas.ids.get(match);
      if (component) {
        return `"#/components/schemas/${match}`;
      }

      const globalInSchema = globalsInSchemas.get(match);
      if (globalInSchema) {
        componentsToReplace.set(match, globalInSchema);
        dynamicComponent.set(match, globalInSchema);
        return `"#/components/schemas/${globalInSchema}"`;
      }

      const manualSchema = registry.schemas.manual.get(match);
      if (manualSchema) {
        componentsToReplace.set(match, manualSchema.key);
        dynamicComponent.set(match, manualSchema.key);
        manualSchema.io[io].used = true;
        return `"#/components/schemas/${manualSchema.key}"`;
      }

      // This schema is not registered but is a dynamic component
      const componentName = `__schema${registry.schemas.dynamicSchemaCount++}`;
      componentsToReplace.set(match, componentName);
      dynamicComponent.set(match, componentName);
      return `"#/components/schemas/${componentName}"`;
    },
  );

  const patchedJsonSchema = JSON.parse(patched) as typeof jsonSchema;
  const components = patchedJsonSchema.schemas.__shared?.$defs ?? {};
  patchedJsonSchema.schemas.__shared ??= { $defs: components };

  for (const [key, value] of registry.schemas.manual) {
    if (value.io[io].used) {
      dynamicComponent.set(key, value.key);
    }
  }

  for (const [key, value] of globalsInSchemas) {
    dynamicComponent.set(key, value);
  }

  for (const [key, value] of dynamicComponent) {
    const component = patchedJsonSchema.schemas[key];
    patchedJsonSchema.schemas[key] = {
      $ref: `#/components/schemas/${value}`,
    };
    components[value] = component as core.JSONSchema.JSONSchema;
  }

  // Check if we have components already in the registry
  // This is fairly likely given schemas may be reused between request schemas and response schemas
  const renamedComponents = new Map<string, string>();
  for (const [key, value] of Object.entries(components)) {
    const registeredComponent = registry.schemas.ids.get(key);
    if (registeredComponent) {
      if (JSON.stringify(registeredComponent) === JSON.stringify(value)) {
        continue;
      }

      // Rename the component as they do not output the same thing
      const newName =
        outputIds.get(key) ??
        `${key}${io.charAt(0).toUpperCase()}${io.slice(1)}`;
      renamedComponents.set(key, newName);
      components[newName] = value;
      delete components[key];
    }
  }

  if (renamedComponents.size === 0) {
    delete patchedJsonSchema.schemas.__shared;
    return {
      schemas: patchedJsonSchema.schemas as Record<
        keyof T,
        oas31.SchemaObject | oas31.ReferenceObject
      >,
      components: components as Record<string, oas31.SchemaObject>,
    };
  }

  // For all the components, replace the keys with the new names
  const renamedStringified = JSON.stringify(patchedJsonSchema).replace(
    /"#\/components\/schemas\/([^"]+)"/g,
    (_, match: string) => {
      const newName = renamedComponents.get(match);
      if (newName) {
        return `"#/components/schemas/${newName}"`;
      }
      return `"#/components/schemas/${match}"`;
    },
  );

  const renamedJsonSchema = JSON.parse(renamedStringified) as typeof jsonSchema;
  const renamedJsonSchemaComponents =
    renamedJsonSchema.schemas.__shared?.$defs ?? {};
  delete renamedJsonSchema.schemas.__shared;
  return {
    schemas: renamedJsonSchema.schemas as Record<
      keyof T,
      oas31.SchemaObject | oas31.ReferenceObject
    >,
    components: renamedJsonSchemaComponents as Record<
      string,
      oas31.SchemaObject
    >,
  };
};
