import {
  type GlobalMeta,
  type core,
  globalRegistry,
  toJSONSchema,
  registry as zodRegistry,
} from 'zod/v4';

import type { CreateDocumentOptions, oas31 } from '../..';
import { type ComponentRegistry, createRegistry } from '../components';

import { override, validate } from './override';
import { renameComponents } from './rename';

const deleteZodOpenApiMeta = (jsonSchema: core.JSONSchema.JSONSchema) => {
  delete jsonSchema.param;
  delete jsonSchema.header;
  delete jsonSchema.unusedIO;
  delete jsonSchema.override;
  delete jsonSchema.outputId;
};

export interface SchemaResult {
  schema: oas31.SchemaObject | oas31.ReferenceObject;
  components: Record<string, oas31.SchemaObject>;
}

type ZodTypeWithMeta = core.$ZodTypes & {
  meta: () => GlobalMeta | undefined;
};

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

      validate(enrichedContext, opts);
    },
    io,
    unrepresentable: 'any',
    uri: (id) => `#/components/schemas/${id}`,
  });

  const sharedDefs = jsonSchema.schemas.__shared?.$defs ?? {};
  jsonSchema.schemas.__shared ??= { $defs: sharedDefs };

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

  const renamedComponents = renameComponents(components, outputIds, {
    registry,
    io,
    opts,
  });

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
