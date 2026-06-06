import { type $ZodType, globalRegistry } from 'zod/v4/core';

import type { OpenApiVersion } from '../openapi.js';
import { isAnyZodType } from '../zod.js';

import { createContent } from './content.js';
import type {
  CreateDocumentOptions,
  ZodOpenApiCallbackObject,
  ZodOpenApiComponentsObject,
  ZodOpenApiExampleObject,
  ZodOpenApiLinkObject,
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
  ZodOpenApiSecuritySchemeObject,
} from './document.js';
import { createExamples } from './examples.js';
import { createHeaders } from './headers.js';
import { createLinks } from './links.js';
import { isRequired } from './object.js';
import { createManualParameters } from './parameters.js';
import { createOperation } from './paths.js';
import { createSchemas } from './schema/schema.js';
import { isISpecificationExtension } from './specificationExtension.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

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
          schemaObject: oas32.SchemaObject | oas32.ReferenceObject;
          source: SchemaSource & { path: string[] };
        }
      >;
      output: Map<
        string,
        {
          zodType: $ZodType;
          schemaObject: oas32.SchemaObject | oas32.ReferenceObject;
          source: SchemaSource & { path: string[] };
        }
      >;
      ids: Map<string, oas32.SchemaObject | oas32.ReferenceObject>;
      manual: Map<
        string,
        {
          input: {
            used?: true;
            schemaObject: oas32.SchemaObject;
          };
          output: {
            used?: true;
            schemaObject: oas32.SchemaObject;
          };
          zodType: $ZodType;
        }
      >;
    };
    headers: {
      ids: Map<string, oas32.HeaderObject | oas32.ReferenceObject>;
      seen: WeakMap<$ZodType, oas32.HeaderObject | oas32.ReferenceObject>;
    };
    requestBodies: {
      ids: Map<string, oas32.RequestBodyObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiRequestBodyObject,
        oas32.RequestBodyObject | oas32.ReferenceObject
      >;
    };
    responses: {
      ids: Map<string, oas32.ResponseObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiResponseObject,
        oas32.ResponseObject | oas32.ReferenceObject
      >;
    };
    parameters: {
      ids: Map<string, oas32.ParameterObject | oas32.ReferenceObject>;
      seen: WeakMap<$ZodType, oas32.ParameterObject | oas32.ReferenceObject>;
    };
    callbacks: {
      ids: Map<string, ZodOpenApiCallbackObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiCallbackObject,
        ZodOpenApiCallbackObject | oas32.ReferenceObject
      >;
    };
    pathItems: {
      ids: Map<string, oas32.PathItemObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiPathItemObject,
        oas32.PathItemObject | oas32.ReferenceObject
      >;
    };
    securitySchemes: {
      ids: Map<string, oas32.SecuritySchemeObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiSecuritySchemeObject,
        oas32.SecuritySchemeObject | oas32.ReferenceObject
      >;
    };
    links: {
      ids: Map<string, oas32.LinkObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiLinkObject,
        oas32.LinkObject | oas32.ReferenceObject
      >;
    };
    examples: {
      ids: Map<string, oas32.ExampleObject | oas32.ReferenceObject>;
      seen: WeakMap<
        ZodOpenApiExampleObject,
        oas32.ExampleObject | oas32.ReferenceObject
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
  ) => oas32.SchemaObject | oas32.ReferenceObject;

  addHeader: (
    header: $ZodType,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.HeaderObject | oas32.ReferenceObject;
  addParameter: (
    parameter: $ZodType,
    path: string[],
    opts?: {
      location?: { in: oas32.ParameterLocation; name: string };
      manualId?: string;
    },
  ) => oas32.ParameterObject | oas32.ReferenceObject;
  addRequestBody: (
    requestBody: ZodOpenApiRequestBodyObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.RequestBodyObject | oas32.ReferenceObject;
  addPathItem: (
    pathItem: ZodOpenApiPathItemObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.PathItemObject | oas32.ReferenceObject;

  addResponse: (
    response: ZodOpenApiResponseObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.ResponseObject | oas32.ReferenceObject;
  addCallback: (
    callback: ZodOpenApiCallbackObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.CallbackObject | oas32.ReferenceObject;
  addSecurityScheme: (
    securityScheme: ZodOpenApiSecuritySchemeObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.SecuritySchemeObject | oas32.ReferenceObject;
  addLink: (
    link: ZodOpenApiLinkObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.LinkObject | oas32.ReferenceObject;
  addExample: (
    example: ZodOpenApiExampleObject,
    path: string[],
    opts?: {
      manualId?: string;
    },
  ) => oas32.ExampleObject | oas32.ReferenceObject;
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
      securitySchemes: {
        ids: new Map(),
        seen: new WeakMap(),
      },
      links: {
        ids: new Map(),
        seen: new WeakMap(),
      },
      examples: {
        ids: new Map(),
        seen: new WeakMap(),
      },
    },
    addSchema: (
      schema,
      path,
      opts,
    ): oas32.SchemaObject | oas32.ReferenceObject => {
      const schemaObject: oas32.SchemaObject = {};

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
    ): oas32.ParameterObject | oas32.ReferenceObject => {
      const seenParameter = registry.components.parameters.seen.get(parameter);
      if (seenParameter) {
        return seenParameter;
      }

      const meta = globalRegistry.get(parameter);

      const name = opts?.location?.name ?? meta?.param?.name;
      const inLocation = opts?.location?.in ?? meta?.param?.in;

      if (
        (opts?.location?.name && meta?.param?.name) ||
        (opts?.location?.in && meta?.param?.in)
      ) {
        throw new Error(
          `Parameter at ${path.join(' > ')} has both \`.meta({ param: { name, in } })\` and \`.meta({ param: { location: { in, name } } })\` information`,
        );
      }

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

      const { id: metaId, examples, ...rest } = meta?.param ?? {};

      const parameterObject: oas32.ParameterObject = {
        in: inLocation,
        name,
        schema: schemaObject,
        ...rest,
      };

      const examplesObject = createExamples(examples, registry, [
        ...path,
        inLocation,
        name,
        'examples',
      ]);

      if (examplesObject) {
        parameterObject.examples = examplesObject;
      }

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
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/parameters/${id}`,
        };
        registry.components.parameters.seen.set(parameter, ref);
        registry.components.parameters.ids.set(id, parameterObject);
        if (opts?.manualId) {
          return parameterObject;
        }
        return ref;
      }

      if (opts?.location?.name || opts?.location?.in) {
        return parameterObject;
      }

      registry.components.parameters.seen.set(parameter, parameterObject);
      return parameterObject;
    },
    addHeader: (
      header,
      path,
      opts,
    ): oas32.HeaderObject | oas32.ReferenceObject => {
      const seenHeader = registry.components.headers.seen.get(header);
      if (seenHeader) {
        return seenHeader;
      }

      const meta = globalRegistry.get(header);

      const { id: metaId, ...rest } = meta?.header ?? {};
      const id = metaId ?? opts?.manualId;

      const headerObject: oas32.HeaderObject = rest;

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
          throw new Error(
            `Schema "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/headers/${id}`,
        };
        registry.components.headers.ids.set(id, headerObject);
        registry.components.headers.seen.set(header, ref);
        if (opts?.manualId) {
          return headerObject;
        }
        return ref;
      }

      registry.components.headers.seen.set(header, headerObject);

      return headerObject;
    },
    addRequestBody: (
      requestBody,
      path,
      opts,
    ): oas32.RequestBodyObject | oas32.ReferenceObject => {
      const seenRequestBody =
        registry.components.requestBodies.seen.get(requestBody);
      if (seenRequestBody) {
        return seenRequestBody;
      }

      const { content, id: metaId, ...rest } = requestBody;

      const requestBodyObject: oas32.RequestBodyObject = {
        ...rest,
        content: createContent(content, { registry, io: 'input' }, [
          ...path,
          'content',
        ]),
      };

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.requestBodies.ids.has(id)) {
          throw new Error(
            `RequestBody "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/requestBodies/${id}`,
        };
        registry.components.requestBodies.ids.set(id, requestBodyObject);
        registry.components.requestBodies.seen.set(requestBody, ref);
        if (opts?.manualId) {
          return requestBodyObject;
        }
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

      const pathItemObject: oas32.PathItemObject = {};

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
          key === 'trace' ||
          key === 'query'
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
              | Array<$ZodType | oas32.ParameterObject | oas32.ReferenceObject>
              | undefined,
            registry,
            [...path, key],
          );
          continue;
        }

        if (key === 'additionalOperations') {
          const additionalOperations: Record<string, oas32.OperationObject> = {};
          for (const [method, operation] of Object.entries(value as Record<string, ZodOpenApiOperationObject>)) {
            additionalOperations[method] = createOperation(
              operation,
              registry,
              [...path, key, method],
            );
          }
          pathItemObject.additionalOperations = additionalOperations;
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        pathItemObject[key as keyof oas32.PathItemObject] = value;
      }

      if (id) {
        if (registry.components.pathItems.ids.has(id)) {
          throw new Error(
            `PathItem "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/pathItems/${id}`,
        };
        registry.components.pathItems.ids.set(id, pathItemObject);
        registry.components.pathItems.seen.set(pathItem, ref);
        if (opts?.manualId) {
          return pathItemObject;
        }
        return ref;
      }

      registry.components.pathItems.seen.set(pathItem, pathItemObject);

      return pathItemObject;
    },
    addResponse: (
      response,
      path,
      opts,
    ): oas32.ResponseObject | oas32.ReferenceObject => {
      const seenResponse = registry.components.responses.seen.get(response);
      if (seenResponse) {
        return seenResponse;
      }

      const { content, headers, links, id: metaId, ...rest } = response;

      const responseObject: oas32.ResponseObject = rest;

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

      if (links) {
        responseObject.links = createLinks(links, registry, [...path, 'links']);
      }

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.responses.ids.has(id)) {
          throw new Error(
            `Response "${id}" at ${path.join(' > ')} is already registered`,
          );
        }

        const ref: oas32.ReferenceObject = {
          $ref: `#/components/responses/${id}`,
        };
        registry.components.responses.ids.set(id, responseObject);
        registry.components.responses.seen.set(response, ref);

        if (opts?.manualId) {
          return responseObject;
        }
        return ref;
      }

      registry.components.responses.seen.set(response, responseObject);

      return responseObject;
    },
    addCallback: (
      callback,
      path,
      opts,
    ): oas32.CallbackObject | oas32.ReferenceObject => {
      const seenCallback = registry.components.callbacks.seen.get(callback);
      if (seenCallback) {
        return seenCallback;
      }

      const { id: metaId, ...rest } = callback;

      const callbackObject: oas32.CallbackObject = {};
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
          throw new Error(
            `Callback "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/callbacks/${id}`,
        };
        registry.components.callbacks.ids.set(id, callbackObject);
        registry.components.callbacks.seen.set(callback, ref);
        if (opts?.manualId) {
          return callbackObject;
        }
        return ref;
      }

      registry.components.callbacks.seen.set(callback, callbackObject);
      return callbackObject;
    },
    addSecurityScheme: (securityScheme, path, opts) => {
      const seenSecurityScheme =
        registry.components.securitySchemes.seen.get(securityScheme);
      if (seenSecurityScheme) {
        return seenSecurityScheme;
      }

      const { id: metaId, ...rest } = securityScheme;
      const securitySchemeObject: oas32.SecuritySchemeObject = rest;

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.securitySchemes.ids.has(id)) {
          throw new Error(
            `SecurityScheme "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/securitySchemes/${id}`,
        };
        registry.components.securitySchemes.ids.set(id, securitySchemeObject);
        registry.components.securitySchemes.seen.set(securityScheme, ref);
        if (opts?.manualId) {
          return securitySchemeObject;
        }
        return ref;
      }

      registry.components.securitySchemes.seen.set(
        securityScheme,
        securitySchemeObject,
      );
      return securitySchemeObject;
    },
    addLink: (link, path, opts) => {
      const seenLink = registry.components.links.seen.get(link);
      if (seenLink) {
        return seenLink;
      }

      const { id: metaId, ...rest } = link;

      const linkObject: oas32.LinkObject = rest;

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.links.ids.has(id)) {
          throw new Error(
            `Link "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/links/${id}`,
        };
        registry.components.links.ids.set(id, linkObject);
        registry.components.links.seen.set(link, ref);
        if (opts?.manualId) {
          return linkObject;
        }
        return ref;
      }

      registry.components.links.seen.set(link, linkObject);
      return linkObject;
    },
    addExample: (
      example,
      path,
      opts,
    ): oas32.ExampleObject | oas32.ReferenceObject => {
      const seenExample = registry.components.examples.seen.get(example);
      if (seenExample) {
        return seenExample;
      }

      const { id: metaId, ...rest } = example;

      const exampleObject: oas32.ExampleObject = rest;

      const id = metaId ?? opts?.manualId;

      if (id) {
        if (registry.components.examples.ids.has(id)) {
          throw new Error(
            `Example "${id}" at ${path.join(' > ')} is already registered`,
          );
        }
        const ref: oas32.ReferenceObject = {
          $ref: `#/components/examples/${id}`,
        };
        registry.components.examples.ids.set(id, exampleObject);
        registry.components.examples.seen.set(example, ref);
        if (opts?.manualId) {
          return exampleObject;
        }
        return ref;
      }

      registry.components.examples.seen.set(example, exampleObject);

      return exampleObject;
    },
  };

  registerSchemas(components?.schemas, registry);
  registerParameters(components?.parameters, registry);
  registerHeaders(components?.headers, registry);
  registerResponses(components?.responses, registry);
  registerPathItems(components?.pathItems, registry);
  registerRequestBodies(components?.requestBodies, registry);
  registerCallbacks(components?.callbacks, registry);
  registerSecuritySchemes(components?.securitySchemes, registry);
  registerLinks(components?.links, registry);
  registerExamples(components?.examples, registry);

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
      schema,
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
      schema as oas32.ParameterObject,
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
    registry.components.headers.ids.set(key, schema as oas32.HeaderObject);
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
      schema as oas32.RequestBodyObject,
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

const registerSecuritySchemes = (
  securitySchemes: ZodOpenApiComponentsObject['securitySchemes'],
  registry: ComponentRegistry,
): void => {
  if (!securitySchemes) {
    return;
  }

  for (const [key, schema] of Object.entries(securitySchemes)) {
    registry.addSecurityScheme(schema, ['components', 'securitySchemes', key], {
      manualId: key,
    });
  }
};

const registerLinks = (
  links: ZodOpenApiComponentsObject['links'],
  registry: ComponentRegistry,
): void => {
  if (!links) {
    return;
  }

  for (const [key, schema] of Object.entries(links)) {
    registry.addLink(schema, ['components', 'links', key], {
      manualId: key,
    });
  }
};

const registerExamples = (
  examples: ZodOpenApiComponentsObject['examples'],
  registry: ComponentRegistry,
): void => {
  if (!examples) {
    return;
  }

  for (const [key, schema] of Object.entries(examples)) {
    registry.components.examples.ids.set(key, schema);
  }
};

const createIOSchemas = (ctx: {
  registry: ComponentRegistry;
  io: 'input' | 'output';
  opts: CreateDocumentOptions;
  openapiVersion?: OpenApiVersion;
}) => {
  const { schemas, components, manual } = createSchemas(
    Object.fromEntries(ctx.registry.components.schemas[ctx.io]),
    ctx,
  );

  for (const [key, schema] of Object.entries(components)) {
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
  openapiVersion?: OpenApiVersion,
) => {
  createIOSchemas({ registry, io: 'input', opts, openapiVersion });
  createIOSchemas({ registry, io: 'output', opts, openapiVersion });
  createManualSchemas(registry);

  const components: oas32.ComponentsObject = {};

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
  if (registry.components.securitySchemes.ids.size > 0) {
    components.securitySchemes = Object.fromEntries(
      registry.components.securitySchemes.ids,
    );
  }
  if (registry.components.links.ids.size > 0) {
    components.links = Object.fromEntries(registry.components.links.ids);
  }
  if (registry.components.examples.ids.size > 0) {
    components.examples = Object.fromEntries(registry.components.examples.ids);
  }

  return components;
};
