import { type $ZodType, globalRegistry } from 'zod/v4/core';

import type { oas31 } from '../openapi3-ts/dist';
import { isAnyZodType } from '../zod';

import { createContent } from './content';
import type {
  CreateDocumentOptions,
  ZodOpenApiCallbackObject,
  ZodOpenApiComponentsObject,
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
} from './document';
import { createHeaders } from './headers';
import { isRequired } from './object';
import { createManualParameters } from './parameters';
import { createOperation } from './paths';
import { createSchemas } from './schema/schema';
import { isISpecificationExtension } from './specificationExtension';

type SchemaSource =
  | {
      type: 'mediaType' | 'header';
    }
  | { type: 'parameter'; location: { in: string; name: string } };

export interface ComponentRegistry {
  components: {
    schemas: {
      dynamicSchemaCount: number;
      input: Map<
        string,
        {
          zodType: $ZodType;
          schemaObject: oas31.SchemaObject | oas31.ReferenceObject;
          source: SchemaSource & { path: string[] };
        }
      >;
      output: Map<
        string,
        {
          zodType: $ZodType;
          schemaObject: oas31.SchemaObject | oas31.ReferenceObject;
          source: SchemaSource & { path: string[] };
        }
      >;
      ids: Map<string, oas31.SchemaObject | oas31.ReferenceObject>;
      manual: Map<
        string,
        {
          input: {
            used?: true;
            schemaObject: oas31.SchemaObject;
          };
          output: {
            used?: true;
            schemaObject: oas31.SchemaObject;
          };
          zodType: $ZodType;
        }
      >;
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
  };
  addSchema: (
    schema: $ZodType,
    path: string[],
    opts: {
      io: 'input' | 'output';
      source: SchemaSource;
    },
  ) => oas31.SchemaObject | oas31.ReferenceObject;

  addHeader: (
    header: $ZodType,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas31.HeaderObject | oas31.ReferenceObject;
  addParameter: (
    parameter: $ZodType,
    path: string[],
    opts?: {
      location?: { in: oas31.ParameterLocation; name: string };
      manualId?: string;
    },
  ) => oas31.ParameterObject | oas31.ReferenceObject;
  addRequestBody: (
    requestBody: ZodOpenApiRequestBodyObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas31.RequestBodyObject | oas31.ReferenceObject;
  addPathItem: (
    pathItem: ZodOpenApiPathItemObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas31.PathItemObject | oas31.ReferenceObject;

  addResponse: (
    response: ZodOpenApiResponseObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas31.ResponseObject | oas31.ReferenceObject;
  addCallback: (
    callback: ZodOpenApiCallbackObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas31.CallbackObject | oas31.ReferenceObject;
}

export const createRegistry = (
  components?: ZodOpenApiComponentsObject,
): ComponentRegistry => {
  const registry: ComponentRegistry = {
    components: {
      schemas: {
        dynamicSchemaCount: 0,
        input: new Map(),
        output: new Map(),
        ids: new Map(),
        manual: new Map(),
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
    },
    addSchema: (
      schema,
      path,
      opts,
    ): oas31.SchemaObject | oas31.ReferenceObject => {
      const schemaObject: oas31.SchemaObject = {};

      registry.components.schemas[opts.io].set(path.join(' > '), {
        schemaObject,
        zodType: schema,
        source: {
          path,
          ...opts?.source,
        },
      });
      return schemaObject;
    },
    addParameter: (
      parameter,
      path,
      opts,
    ): oas31.ParameterObject | oas31.ReferenceObject => {
      const seenParameter = registry.components.parameters.seen.get(parameter);
      if (seenParameter) {
        return seenParameter as oas31.ParameterObject;
      }

      const meta = globalRegistry.get(parameter);

      const name = opts?.location?.name ?? meta?.param?.name;
      const inLocation = opts?.location?.in ?? meta?.param?.in;

      if (!name || !inLocation) {
        throw new Error(
          `Parameter at ${path.join(' > ')} is missing \`.meta({ param: { name, in } })\` information`,
        );
      }

      const schemaObject = registry.addSchema(
        parameter,
        [...path, inLocation, name, 'schema'],
        {
          io: 'input',
          source: { type: 'parameter', location: { in: inLocation, name } },
        },
      );

      const { id: metaId, ...rest } = meta?.param ?? {};

      const parameterObject: oas31.ParameterObject = {
        ...rest,
        name,
        in: inLocation,
        schema: schemaObject,
      };

      if (isRequired(parameter, 'input')) {
        parameterObject.required = true;
      }

      if (!parameterObject.description && meta?.description) {
        parameterObject.description = meta.description;
      }

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.parameters.ids.has(id)) {
          throw new Error(
            `Schema "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas31.ReferenceObject = {
          $ref: `#/components/parameters/${id}`,
        };
        registry.components.parameters.seen.set(parameter, ref);
        registry.components.parameters.ids.set(id, parameterObject);
        return ref;
      }

      registry.components.parameters.seen.set(parameter, parameterObject);
      return parameterObject;
    },
    addHeader: (
      header,
      path,
      opts,
    ): oas31.HeaderObject | oas31.ReferenceObject => {
      const seenHeader = registry.components.headers.seen.get(header);
      if (seenHeader) {
        return seenHeader as oas31.HeaderObject;
      }

      const meta = globalRegistry.get(header);

      const { id: metaId, ...rest } = meta?.header ?? {};
      const id = metaId ?? opts?.manualId;

      const headerObject: oas31.HeaderObject = rest;

      if (isRequired(header, 'output')) {
        headerObject.required = true;
      }

      if (!headerObject.description && meta?.description) {
        headerObject.description = meta.description;
      }

      headerObject.schema = registry.addSchema(header, [...path, 'schema'], {
        io: 'output',
        source: { type: 'header' },
      });

      if (id) {
        if (registry.components.schemas.ids.has(id)) {
          throw new Error(`Schema "${id}" is already registered`);
        }
        const ref: oas31.ReferenceObject = {
          $ref: `#/components/headers/${id}`,
        };
        registry.components.headers.ids.set(id, headerObject);
        registry.components.headers.seen.set(header, ref);
        return ref;
      }

      registry.components.headers.seen.set(header, headerObject);

      return headerObject;
    },
    addRequestBody: (
      requestBody,
      path,
      opts,
    ): oas31.RequestBodyObject | oas31.ReferenceObject => {
      const seenRequestBody =
        registry.components.requestBodies.seen.get(requestBody);
      if (seenRequestBody) {
        return seenRequestBody as oas31.RequestBodyObject;
      }

      const { content, id: metaId, ...rest } = requestBody;

      const requestBodyObject: oas31.RequestBodyObject = {
        ...rest,
        content: createContent(content, { registry, io: 'input' }, [
          ...path,
          'content',
        ]),
      };

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.requestBodies.ids.has(id)) {
          throw new Error(`RequestBody "${id}" is already registered`);
        }
        const ref: oas31.ReferenceObject = {
          $ref: `#/components/requestBodies/${id}`,
        };
        registry.components.requestBodies.ids.set(id, requestBodyObject);
        registry.components.requestBodies.seen.set(requestBody, ref);
        return ref;
      }

      registry.components.requestBodies.seen.set(
        requestBody,
        requestBodyObject,
      );

      return requestBodyObject;
    },
    addPathItem: (pathItem, path, opts) => {
      const seenPathItem = registry.components.pathItems.seen.get(pathItem);
      if (seenPathItem) {
        return seenPathItem;
      }

      const pathItemObject: oas31.PathItemObject = {};

      const { id: metaId, ...rest } = pathItem;

      const id = metaId ?? opts?.manualId;

      for (const [key, value] of Object.entries(rest)) {
        if (isISpecificationExtension(key)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          pathItemObject[key] = value;
          continue;
        }

        if (
          key === 'get' ||
          key === 'put' ||
          key === 'post' ||
          key === 'delete' ||
          key === 'options' ||
          key === 'head' ||
          key === 'patch' ||
          key === 'trace'
        ) {
          pathItemObject[key] = createOperation(
            value as ZodOpenApiOperationObject,
            registry,
            [...path, key],
          );
          continue;
        }

        if (key === 'parameters') {
          pathItemObject[key] = createManualParameters(
            value as
              | Array<$ZodType | oas31.ParameterObject | oas31.ReferenceObject>
              | undefined,
            registry,
            [...path, key],
          );
          continue;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pathItemObject[key as keyof oas31.PathItemObject] = value;
      }

      if (id) {
        if (registry.components.pathItems.ids.has(id)) {
          throw new Error(`PathItem "${id}" is already registered`);
        }
        const ref: oas31.ReferenceObject = {
          $ref: `#/components/pathItems/${id}`,
        };
        registry.components.pathItems.ids.set(id, pathItemObject);
        registry.components.pathItems.seen.set(pathItem, ref);
        return ref;
      }

      registry.components.pathItems.seen.set(pathItem, pathItemObject);

      return pathItemObject;
    },
    addResponse: (
      response,
      path,
      opts,
    ): oas31.ResponseObject | oas31.ReferenceObject => {
      const seenResponse = registry.components.responses.seen.get(response);
      if (seenResponse) {
        return seenResponse;
      }

      const { content, headers, id: metaId, ...rest } = response;

      const responseObject: oas31.ResponseObject = rest;

      const maybeHeaders = createHeaders(headers, registry, [
        ...path,
        'headers',
      ]);
      if (maybeHeaders) {
        responseObject.headers = maybeHeaders;
      }

      if (content) {
        responseObject.content = createContent(
          content,
          { registry, io: 'output' },
          [...path, 'content'],
        );
      }

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.responses.ids.has(id)) {
          throw new Error(`Response "${id}" is already registered`);
        }

        const ref: oas31.ReferenceObject = {
          $ref: `#/components/responses/${id}`,
        };
        registry.components.responses.ids.set(id, responseObject);
        registry.components.responses.seen.set(response, ref);
        return ref;
      }

      registry.components.responses.seen.set(response, responseObject);

      return responseObject;
    },
    addCallback: (
      callback,
      path,
      opts,
    ): oas31.CallbackObject | oas31.ReferenceObject => {
      const seenCallback = registry.components.callbacks.seen.get(callback);
      if (seenCallback) {
        return seenCallback;
      }

      const { id: metaId, ...rest } = callback;

      const callbackObject: oas31.CallbackObject = {};
      for (const [name, pathItem] of Object.entries(rest)) {
        if (isISpecificationExtension(name)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          callbackObject[name] = pathItem;
          continue;
        }

        callbackObject[name] = registry.addPathItem(
          pathItem as ZodOpenApiPathItemObject,
          [...path, name],
        );
      }

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.callbacks.ids.has(id)) {
          throw new Error(`Callback "${id}" is already registered`);
        }
        const ref: oas31.ReferenceObject = {
          $ref: `#/components/callbacks/${id}`,
        };
        registry.components.callbacks.ids.set(id, callbackObject);
        registry.components.callbacks.seen.set(callback, ref);
        return ref;
      }

      registry.components.callbacks.seen.set(callback, callbackObject);
      return callbackObject;
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

const registerSchemas = (
  schemas: ZodOpenApiComponentsObject['schemas'],
  registry: ComponentRegistry,
): void => {
  if (!schemas) {
    return;
  }

  for (const [key, schema] of Object.entries(schemas)) {
    if (isAnyZodType(schema)) {
      const id = globalRegistry.get(schema)?.id ?? key;
      registry.components.schemas.manual.set(id, {
        input: {
          schemaObject: {},
        },
        output: {
          schemaObject: {},
        },
        zodType: schema,
      });
      continue;
    }

    registry.components.schemas.ids.set(
      key,
      schema as oas31.SchemaObject | oas31.ReferenceObject,
    );
  }
};

const registerParameters = (
  parameters: ZodOpenApiComponentsObject['parameters'],
  registry: ComponentRegistry,
): void => {
  if (!parameters) {
    return;
  }

  for (const [key, schema] of Object.entries(parameters)) {
    if (isAnyZodType(schema)) {
      const path = ['components', 'parameters', key];
      registry.addParameter(schema, path, {
        manualId: key,
      });
      continue;
    }

    // Raw OpenAPI Parameter we should just blindly insert into the components
    registry.components.parameters.ids.set(
      key,
      schema as oas31.ParameterObject,
    );
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
    if (isAnyZodType(schema)) {
      const path = ['components', 'headers', key];
      registry.addHeader(schema, path, { manualId: key });
      continue;
    }
    registry.components.headers.ids.set(key, schema as oas31.HeaderObject);
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
    const responseObject = registry.addResponse(
      schema,
      ['components', 'responses', key],
      { manualId: key },
    );

    registry.components.responses.ids.set(key, responseObject);
    registry.components.responses.seen.set(schema, responseObject);
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
    if (isAnyZodType(schema)) {
      registry.addRequestBody(schema, ['components', 'requestBodies', key], {
        manualId: key,
      });
      continue;
    }

    // Raw OpenAPI Request Body we should just blindly insert into the components
    registry.components.requestBodies.ids.set(
      key,
      schema as oas31.RequestBodyObject,
    );
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
    registry.addCallback(schema, ['components', 'callbacks', key], {
      manualId: key,
    });
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
    registry.addPathItem(schema, ['components', 'pathItems', key], {
      manualId: key,
    });
  }
};

const createIOSchemas = (ctx: {
  registry: ComponentRegistry;
  io: 'input' | 'output';
  opts: CreateDocumentOptions;
}) => {
  const { schemas, components, manual } = createSchemas(
    Object.fromEntries(ctx.registry.components.schemas[ctx.io]),
    ctx,
  );

  for (const [key, schema] of Object.entries(components)) {
    if (ctx.registry.components.schemas.ids.has(key)) {
      throw new Error(`Schema "${key}" is already registered`);
    }
    ctx.registry.components.schemas.ids.set(key, schema);
  }

  for (const [key, schema] of Object.entries(schemas)) {
    const ioSchema = ctx.registry.components.schemas[ctx.io].get(key);

    if (ioSchema) {
      Object.assign(ioSchema.schemaObject, schema);
    }
  }

  for (const [key, value] of Object.entries(manual)) {
    const manualSchema = ctx.registry.components.schemas.manual.get(key);
    if (!manualSchema) {
      continue;
    }

    if (components[key]) {
      manualSchema[ctx.io].used = true;
    }

    Object.assign(manualSchema[ctx.io].schemaObject, value);
  }
};

const createManualSchemas = (registry: ComponentRegistry) => {
  for (const [key, value] of registry.components.schemas.manual) {
    if (!value.input.used) {
      const io = globalRegistry.get(value.zodType)?.unusedIO ?? 'output';
      const schema = value[io].schemaObject;
      registry.components.schemas.ids.set(key, schema);
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

  if (registry.components.schemas.ids.size > 0) {
    components.schemas = Object.fromEntries(registry.components.schemas.ids);
  }
  if (registry.components.headers.ids.size > 0) {
    components.headers = Object.fromEntries(registry.components.headers.ids);
  }
  if (registry.components.requestBodies.ids.size > 0) {
    components.requestBodies = Object.fromEntries(
      registry.components.requestBodies.ids,
    );
  }
  if (registry.components.responses.ids.size > 0) {
    components.responses = Object.fromEntries(
      registry.components.responses.ids,
    );
  }
  if (registry.components.parameters.ids.size > 0) {
    components.parameters = Object.fromEntries(
      registry.components.parameters.ids,
    );
  }
  if (registry.components.callbacks.ids.size > 0) {
    components.callbacks = Object.fromEntries(
      registry.components.callbacks.ids,
    );
  }
  if (registry.components.pathItems.ids.size > 0) {
    components.pathItems = Object.fromEntries(
      registry.components.pathItems.ids,
    );
  }

  return components;
};
