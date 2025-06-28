import {
  type GlobalMeta,
  type core,
  object,
  registry,
  toJSONSchema,
} from 'zod/v4';
import type { $ZodType } from 'zod/v4/core';

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
    ctx.registry.components.schemas[ctx.io],
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
  ctx: {
    registry: ComponentRegistry;
    io: 'input' | 'output';
    opts: CreateDocumentOptions;
  },
): {
  schemas: Record<keyof T, oas31.SchemaObject | oas31.ReferenceObject>;
  components: Record<string, oas31.SchemaObject>;
  manual: Record<string, oas31.SchemaObject>;
} => {
  const refPath = ctx.opts.schemaRefPath ?? '#/components/schemas/';
  const entries: Record<string, $ZodType> = {};
  for (const [name, { zodType }] of Object.entries(schemas)) {
    entries[name] = zodType;
  }
  const zodRegistry = registry<GlobalMeta>();
  zodRegistry.add(object(entries), {
    id: 'zodOpenApiCreateSchema',
  });
  for (const [id, { zodType }] of ctx.registry.components.schemas.manual) {
    zodRegistry.add(zodType, { id });
  }

  const outputIds = new Map<string, string>();
  const jsonSchema = toJSONSchema(zodRegistry, {
    override(context) {
      const meta = (context.zodSchema as ZodTypeWithMeta).meta();
      if (meta?.outputId && meta?.id) {
        // If the schema has an outputId, we need to replace it later
        outputIds.set(meta.id, meta.outputId);
      }

      if (context.jsonSchema.$ref) {
        return;
      }

      const enrichedContext = { ...context, io: ctx.io };

      override(enrichedContext);
      if (typeof ctx.opts.override === 'function') {
        ctx.opts.override(enrichedContext);
      }
      if (typeof meta?.override === 'function') {
        meta.override(enrichedContext);
        delete context.jsonSchema.override;
      }
      if (typeof meta?.override === 'object' && meta.override !== null) {
        Object.assign(context.jsonSchema, meta.override);
        delete context.jsonSchema.override;
      }

      delete context.jsonSchema.$schema;
      delete context.jsonSchema.id;
      deleteZodOpenApiMeta(context.jsonSchema);
      validate(enrichedContext, ctx.opts);
    },
    io: ctx.io,
    unrepresentable: 'any',
    reused: ctx.opts.reused,
    cycles: ctx.opts.cycles,
    uri: (id) =>
      id === '__shared'
        ? `#ZOD_OPENAPI/${id}`
        : `#ZOD_OPENAPI/__shared#/$defs/${id}`,
  });

  const components = jsonSchema.schemas.__shared?.$defs ?? {};
  jsonSchema.schemas.__shared ??= { $defs: components };

  const dynamicComponents = new Map<string, string>();
  for (const [key, value] of Object.entries(components)) {
    if (/^schema\d+$/.test(key)) {
      const newName = `__schema${ctx.registry.components.schemas.dynamicSchemaCount++}`;
      dynamicComponents.set(key, `"${refPath}${newName}"`);
      if (newName !== key) {
        components[newName] = value;
        delete components[key];
      }
    }
  }

  const manualUsed: Record<string, true> = {};
  const parsedJsonSchema = JSON.parse(
    JSON.stringify(jsonSchema).replace(
      /"#ZOD_OPENAPI\/__shared#\/\$defs\/([^"]+)"/g,
      (_, match: string) => {
        const dynamic = dynamicComponents.get(match);
        if (dynamic) {
          return dynamic;
        }
        const manualComponent =
          ctx.registry.components.schemas.manual.get(match);
        if (manualComponent) {
          manualUsed[match] = true;
        }
        return `"${refPath}${match}"`;
      },
    ),
  ) as typeof jsonSchema;

  const parsedComponents = parsedJsonSchema.schemas.__shared?.$defs ?? {};
  parsedJsonSchema.schemas.__shared ??= { $defs: parsedComponents };

  for (const [key] of ctx.registry.components.schemas.manual) {
    const manualComponent = parsedJsonSchema.schemas[key];
    if (!manualComponent) {
      continue;
    }
    delete manualComponent.$schema;
    delete manualComponent.id;

    if (manualUsed[key]) {
      delete manualComponent.$schema;
      delete manualComponent.id;
      if (parsedComponents[key]) {
        throw new Error(
          `Component "${key}" is already registered as a component in the registry`,
        );
      }
      parsedComponents[key] = manualComponent;
    }
  }

  const componentsToRename = renameComponents(
    parsedComponents,
    outputIds,
    ctx,
    refPath,
  );

  if (!componentsToRename.size) {
    const parsedSchemas =
      parsedJsonSchema.schemas.zodOpenApiCreateSchema?.properties;

    delete parsedJsonSchema.schemas.zodOpenApiCreateSchema;
    delete parsedJsonSchema.schemas.__shared;

    return {
      schemas: parsedSchemas as Record<
        keyof T,
        oas31.SchemaObject | oas31.ReferenceObject
      >,
      components: parsedComponents as Record<string, oas31.SchemaObject>,
      manual: parsedJsonSchema.schemas as Record<string, oas31.SchemaObject>,
    };
  }

  const renamedJsonSchema = JSON.parse(
    JSON.stringify(parsedJsonSchema).replace(
      new RegExp(`"${refPath}([^"]+)"`, 'g'),
      (_, match: string) => {
        const replacement = componentsToRename.get(match);
        if (replacement) {
          return `"${refPath}${replacement}"`;
        }

        return `"${refPath}${match}"`;
      },
    ),
  ) as typeof jsonSchema;

  const renamedSchemas =
    renamedJsonSchema.schemas.zodOpenApiCreateSchema?.properties;
  const renamedComponents = renamedJsonSchema.schemas.__shared?.$defs ?? {};
  delete renamedJsonSchema.schemas.zodOpenApiCreateSchema;
  delete renamedJsonSchema.schemas.__shared;

  return {
    schemas: renamedSchemas as Record<
      keyof T,
      oas31.SchemaObject | oas31.ReferenceObject
    >,
    components: renamedComponents as Record<string, oas31.SchemaObject>,
    manual: renamedJsonSchema.schemas as Record<string, oas31.SchemaObject>,
  };
};
