import { type $ZodType, globalRegistry } from 'zod/v4/core';

import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import { createCallback } from './callbacks';
import { registerSchemas } from './componentsSideEffects';
import type {
  CreateDocumentOptions,
  ZodOpenApiCallbackObject,
  ZodOpenApiComponentsObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
} from './document';
import { createHeader } from './headers';
import { createParameter } from './parameters';
import { createPathItem } from './paths';
import { createRequestBody } from './requestBody';
import { createResponse } from './responses';
import { createSchemas } from './schema/schema';

export interface ComponentRegistry {
  /**
   * Contains a map of component name to their OpenAPI schema object or reference.
   */
  schemas: {
    dynamicSchemaCount: number;
    input: Map<
      string,
      {
        zodType: $ZodType;
        schemaObject: oas31.SchemaObject | oas31.ReferenceObject;
      }
    >;
    output: Map<
      string,
      {
        zodType: $ZodType;
        schemaObject: oas31.SchemaObject | oas31.ReferenceObject;
      }
    >;
    ids: Map<string, oas31.SchemaObject | oas31.ReferenceObject>;
    manual: Map<
      string,
      {
        identifier: string;
        io: {
          input: {
            used: number;
            schemaObject: oas31.SchemaObject;
          };
          output: {
            used: number;
            schemaObject: oas31.SchemaObject;
          };
        };
        zodType: $ZodType;
      }
    >;
    setSchema: (
      key: string,
      schema: $ZodType,
      io: 'input' | 'output',
    ) => oas31.SchemaObject | oas31.ReferenceObject;
  };
  headers: {
    ids: Map<string, oas31.HeaderObject | oas31.ReferenceObject>;
    seen: WeakMap<$ZodType, oas31.HeaderObject | oas31.ReferenceObject>;
  };
  requestBodies: {
    ids: Map<string, oas31.RequestBodyObject | oas31.ReferenceObject>;
    seen: WeakMap<
      ZodOpenApiRequestBodyObject,
      oas31.RequestBodyObject | oas31.ReferenceObject
    >;
  };
  responses: {
    ids: Map<string, oas31.ResponseObject | oas31.ReferenceObject>;
    seen: WeakMap<
      ZodOpenApiResponseObject,
      oas31.ResponseObject | oas31.ReferenceObject
    >;
  };
  parameters: {
    ids: Map<string, oas31.ParameterObject | oas31.ReferenceObject>;
    seen: WeakMap<$ZodType, oas31.ParameterObject | oas31.ReferenceObject>;
  };
  callbacks: {
    ids: Map<string, ZodOpenApiCallbackObject | oas31.ReferenceObject>;
    seen: WeakMap<
      ZodOpenApiCallbackObject,
      ZodOpenApiCallbackObject | oas31.ReferenceObject
    >;
  };
  pathItems: {
    ids: Map<string, oas31.PathItemObject | oas31.ReferenceObject>;
    seen: WeakMap<
      ZodOpenApiPathItemObject,
      oas31.PathItemObject | oas31.ReferenceObject
    >;
  };
}

export const createRegistry = (
  components?: ZodOpenApiComponentsObject,
): ComponentRegistry => {
  const registry: ComponentRegistry = {
    schemas: {
      dynamicSchemaCount: 0,
      input: new Map(),
      output: new Map(),
      ids: new Map(),
      manual: new Map(),
      setSchema: (
        key: string,
        schema: $ZodType,
        io: 'input' | 'output',
      ): oas31.SchemaObject | oas31.ReferenceObject => {
        const schemaObject: oas31.SchemaObject = {};

        registry.schemas[io].set(key, {
          schemaObject,
          zodType: schema,
        });
        return schemaObject;
      },
    },
    headers: {
      ids: new Map(),
      seen: new WeakMap(),
    },
    requestBodies: {
      ids: new Map(),
      seen: new WeakMap(),
    },
    responses: {
      ids: new Map(),
      seen: new WeakMap(),
    },
    parameters: {
      ids: new Map(),
      seen: new WeakMap(),
    },
    callbacks: {
      ids: new Map(),
      seen: new WeakMap(),
    },
    pathItems: {
      ids: new Map(),
      seen: new WeakMap(),
    },
  };

  registerSchemas(components?.schemas, registry);
  registerParameters(components?.parameters, registry);
  registerHeaders(components?.headers, registry);
  registerResponses(components?.responses, registry);
  registerPathItems(components?.pathItems, registry);
  registerRequestBodies(components?.requestBodies, registry);
  registerCallbacks(components?.callbacks, registry);

  return registry;
};

const registerParameters = (
  parameters: ZodOpenApiComponentsObject['parameters'],
  registry: ComponentRegistry,
): void => {
  if (!parameters) {
    return;
  }

  for (const [key, schema] of Object.entries(parameters)) {
    if (registry.parameters.ids.has(key)) {
      throw new Error(`Parameter "${key}" is already registered`);
    }

    if (isAnyZodType(schema)) {
      const path = ['components', 'parameters', key];
      const paramObject = createParameter(
        schema,
        undefined,
        {
          registry,
          io: 'input',
        },
        path,
      );
      registry.parameters.ids.set(key, paramObject);
      registry.parameters.seen.set(schema, paramObject);
      continue;
    }

    // Raw OpenAPI Parameter we should just blindly insert into the components
    registry.parameters.ids.set(key, schema as oas31.ParameterObject);
  }
};

const registerHeaders = (
  headers: ZodOpenApiComponentsObject['headers'],
  registry: ComponentRegistry,
): void => {
  if (!headers) {
    return;
  }
  for (const [key, schema] of Object.entries(headers)) {
    if (registry.headers.ids.has(key)) {
      throw new Error(`Header "${key}" is already registered`);
    }
    if (isAnyZodType(schema)) {
      const path = ['components', 'headers', key];
      const headerObject = createHeader(
        schema,
        {
          registry,
          io: 'output',
        },
        path,
      );
      registry.headers.ids.set(key, headerObject);
      registry.headers.seen.set(schema, headerObject);
      continue;
    }
    registry.headers.ids.set(key, schema as oas31.HeaderObject);
  }
};

const registerResponses = (
  responses: ZodOpenApiComponentsObject['responses'],
  registry: ComponentRegistry,
): void => {
  if (!responses) {
    return;
  }
  for (const [key, schema] of Object.entries(responses)) {
    const path = ['components', 'responses', key];
    if (registry.responses.ids.has(key)) {
      throw new Error(`Response "${key}" is already registered`);
    }

    const responseObject = createResponse(
      schema,
      {
        registry,
        io: 'output',
      },
      path,
    );
    registry.responses.ids.set(key, responseObject);
    registry.responses.seen.set(schema, responseObject);
  }
};

const registerRequestBodies = (
  requestBodies: ZodOpenApiComponentsObject['requestBodies'],
  registry: ComponentRegistry,
): void => {
  if (!requestBodies) {
    return;
  }

  for (const [key, schema] of Object.entries(requestBodies)) {
    if (registry.requestBodies.ids.has(key)) {
      throw new Error(`RequestBody "${key}" is already registered`);
    }

    if (isAnyZodType(schema)) {
      const path = ['components', 'requestBodies', key];
      const requestBodyObject = createRequestBody(
        schema,
        {
          registry,
          io: 'input',
        },
        path,
      ) as oas31.RequestBodyObject;
      registry.requestBodies.ids.set(key, requestBodyObject);
      continue;
    }

    // Raw OpenAPI Request Body we should just blindly insert into the components
    registry.requestBodies.ids.set(key, schema as oas31.RequestBodyObject);
  }
};

const registerCallbacks = (
  callbacks: ZodOpenApiComponentsObject['callbacks'],
  registry: ComponentRegistry,
): void => {
  if (!callbacks) {
    return;
  }

  for (const [key, schema] of Object.entries(callbacks)) {
    if (registry.callbacks.ids.has(key)) {
      throw new Error(`Callback "${key}" is already registered`);
    }

    const path = ['components', 'callbacks', key];
    const callbackObject = createCallback(schema, registry, path);
    registry.callbacks.ids.set(key, callbackObject);
    registry.callbacks.seen.set(schema, callbackObject);
  }
};

const registerPathItems = (
  pathItems: ZodOpenApiComponentsObject['pathItems'],
  registry: ComponentRegistry,
): void => {
  if (!pathItems) {
    return;
  }

  for (const [key, schema] of Object.entries(pathItems)) {
    if (registry.pathItems.ids.has(key)) {
      throw new Error(`PathItem "${key}" is already registered`);
    }
    const path = ['components', 'pathItems', key];
    const pathItemObject = createPathItem(schema, registry, path);
    registry.pathItems.ids.set(key, pathItemObject);
    registry.pathItems.seen.set(schema, pathItemObject);
    continue;
  }
};

const createIOSchemas = (ctx: {
  registry: ComponentRegistry;
  io: 'input' | 'output';
  opts: CreateDocumentOptions;
}) => {
  const { schemas, components } = createSchemas(
    Object.fromEntries(ctx.registry.schemas[ctx.io]),
    ctx,
  );

  for (const [key, schema] of Object.entries(components)) {
    ctx.registry.schemas.ids.set(key, schema);
  }

  for (const [key, schema] of Object.entries(schemas)) {
    const ioSchema = ctx.registry.schemas[ctx.io].get(key);

    if (ioSchema) {
      Object.assign(ioSchema.schemaObject, schema);
    }
  }
};

const createManualSchemas = (registry: ComponentRegistry) => {
  for (const [key, value] of registry.schemas.manual) {
    if (value.io.input.used === 1) {
      const io = globalRegistry.get(value.zodType)?.unusedIO ?? 'output';
      const schema = value.io[io].schemaObject;
      registry.schemas.ids.set(key, schema);
    }
  }
};

export const createComponents = (
  registry: ComponentRegistry,
  opts: CreateDocumentOptions,
) => {
  createIOSchemas({ registry, io: 'input', opts });
  createIOSchemas({ registry, io: 'output', opts });
  createManualSchemas(registry);

  const components: oas31.ComponentsObject = {};

  if (registry.schemas.ids.size > 0) {
    components.schemas = Object.fromEntries(registry.schemas.ids);
  }
  if (registry.headers.ids.size > 0) {
    components.headers = Object.fromEntries(registry.headers.ids);
  }
  if (registry.requestBodies.ids.size > 0) {
    components.requestBodies = Object.fromEntries(registry.requestBodies.ids);
  }
  if (registry.responses.ids.size > 0) {
    components.responses = Object.fromEntries(registry.responses.ids);
  }
  if (registry.parameters.ids.size > 0) {
    components.parameters = Object.fromEntries(registry.parameters.ids);
  }
  if (registry.callbacks.ids.size > 0) {
    components.callbacks = Object.fromEntries(registry.callbacks.ids);
  }
  if (registry.pathItems.ids.size > 0) {
    components.pathItems = Object.fromEntries(registry.pathItems.ids);
  }

  return components;
};
