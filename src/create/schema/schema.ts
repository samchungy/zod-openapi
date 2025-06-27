import { type GlobalMeta, type core, object, toJSONSchema } from 'zod/v4';
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

  const registrySchemas = Object.fromEntries(ctx.registry.schemas[ctx.io]);
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
} => {
  const entries: Record<string, $ZodType> = {};
  for (const [name, { zodType }] of Object.entries(schemas)) {
    entries[name] = zodType;
  }
  const schemaRegistry = object(entries);

  const outputIds = new Map<string, string>();
  const jsonSchema = toJSONSchema(schemaRegistry, {
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
  });

  const components = jsonSchema.$defs ?? {};
  const dynamicComponents = new Map<string, string>();
  for (const [key, value] of Object.entries(components)) {
    if (/^__schema\d+$/.test(key)) {
      const newName = `__schema${ctx.registry.schemas.dynamicSchemaCount++}`;
      dynamicComponents.set(key, `"#/components/schemas/${newName}"`);
      if (newName !== key) {
        components[newName] = value;
        delete components[key];
      }
    }
  }

  const parsedJsonSchema = JSON.parse(
    JSON.stringify(jsonSchema).replace(
      /"#\/\$defs\/([^"]+)"/g,
      (_, match: string) => {
        const dynamic = dynamicComponents.get(match);
        if (dynamic) {
          return dynamic;
        }
        const manualComponent = ctx.registry.schemas.manual.get(match);
        if (manualComponent) {
          manualComponent.io[ctx.io].used++;
        }
        return `"#/components/schemas/${match}"`;
      },
    ),
  ) as core.JSONSchema.JSONSchema;

  for (const [key, value] of ctx.registry.schemas.manual) {
    if (
      value.io[ctx.io].used === 1 &&
      parsedJsonSchema.properties?.[value.identifier] &&
      parsedJsonSchema.$defs?.[key]
    ) {
      parsedJsonSchema.properties[value.identifier] =
        parsedJsonSchema.$defs[key];
      delete parsedJsonSchema.$defs[key];
      continue;
    }
  }

  const renamedComponents = renameComponents(
    parsedJsonSchema.$defs ?? {},
    outputIds,
    ctx,
  );

  if (!renamedComponents.size) {
    return {
      schemas: parsedJsonSchema.properties as Record<
        keyof T,
        oas31.SchemaObject | oas31.ReferenceObject
      >,
      components: (parsedJsonSchema.$defs ?? {}) as Record<
        string,
        oas31.SchemaObject
      >,
    };
  }

  const renamedJsonSchema = JSON.parse(
    JSON.stringify(parsedJsonSchema).replace(
      /"#\/components\/schemas\/([^"]+)"/g,
      (_, match: string) => {
        const replacement = renamedComponents.get(match);
        if (replacement) {
          return `"#/components/schemas/${replacement}"`;
        }

        return `"#/components/schemas/${match}"`;
      },
    ),
  ) as core.JSONSchema.JSONSchema;

  return {
    schemas: renamedJsonSchema.properties as Record<
      keyof T,
      oas31.SchemaObject | oas31.ReferenceObject
    >,
    components: (renamedJsonSchema.$defs ?? {}) as Record<
      string,
      oas31.SchemaObject
    >,
  };
};
