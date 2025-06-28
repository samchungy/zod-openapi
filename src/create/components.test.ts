import { type ZodType, z } from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist';

import { createComponents, createRegistry } from './components';
import type {
  CreateDocumentOptions,
  ZodOpenApiHeaderObject,
  ZodOpenApiParameterObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
} from './document';

describe('createComponents', () => {
  it('should create a schema for dynamic input types', () => {
    const zodSchema = z
      .object({
        name: z.string().meta({ id: 'input' }),
        age: z.number(),
        get foo() {
          return zodSchema;
        },
      })
      .meta({ id: 'zodSchema' });

    const nestedSchema = z.object({
      nested: zodSchema,
    });

    const registry = createRegistry();
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const nestedRequestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: nestedSchema,
          },
        },
      },
      ['test', 'nested'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/zodSchema',
          },
        },
      },
    });

    expect(nestedRequestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              nested: {
                $ref: '#/components/schemas/zodSchema',
              },
            },
            required: ['nested'],
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      zodSchema: {
        type: 'object',
        properties: {
          name: {
            $ref: '#/components/schemas/input',
          },
          age: {
            type: 'number',
          },
          foo: {
            $ref: '#/components/schemas/zodSchema',
          },
        },
        required: ['name', 'age', 'foo'],
      },
      input: {
        type: 'string',
      },
    });
  });

  it('should handle a manual schema component which is referenced in an outside schema', () => {
    const manual = z.object({
      id: z.string(),
    });
    const registry = createRegistry({
      schemas: {
        manual,
      },
    });
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: manual,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/manual',
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      manual: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
    });
  });

  it('should handle a manual schema component which is referenced in an nested schema', () => {
    const manual2 = z.object({
      id: z.string(),
    });
    const registry = createRegistry({
      schemas: {
        manual2,
      },
    });
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: z.object({
              a: manual2,
            }),
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              a: {
                $ref: '#/components/schemas/manual2',
              },
            },
            required: ['a'],
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      manual2: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
    });
  });

  it('should handle a manual schema component which is referenced in both a request and response', () => {
    const manual3 = z.object({
      id: z.string(),
    });
    const registry = createRegistry({
      schemas: {
        manual3,
      },
    });
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: z.object({
              a: manual3,
            }),
          },
        },
      },
      ['test'],
    );

    const responseBody = registry.addResponse(
      {
        description: 'foo',
        content: {
          'application/json': {
            schema: z.object({
              b: manual3,
            }),
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              a: {
                $ref: '#/components/schemas/manual3',
              },
            },
            required: ['a'],
          },
        },
      },
    });

    expect(responseBody).toEqual<oas31.RequestBodyObject>({
      description: 'foo',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              b: {
                $ref: '#/components/schemas/manual3Output',
              },
            },
            required: ['b'],
            additionalProperties: false,
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      manual3: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
      manual3Output: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should handle a manual schema component which is not referenced in any request and response', () => {
    const manual4 = z.object({
      id: z.string(),
    });
    const registry = createRegistry({
      schemas: {
        manual4,
      },
    });
    const opts = {};

    const components = createComponents(registry, opts);

    expect(components.schemas).toEqual({
      manual4: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should handle a manual schema component which is not referenced in any request and response but has an reusedIO set', () => {
    const manual5 = z
      .object({
        id: z.string(),
      })
      .meta({ unusedIO: 'input' });
    const registry = createRegistry({
      schemas: {
        manual5,
      },
    });
    const opts = {};

    const components = createComponents(registry, opts);

    expect(components.schemas).toEqual({
      manual5: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
    });
  });

  it('should handle an auto registered schema component which is referenced in a request', () => {
    const zodSchema = z
      .object({
        id: z.string(),
      })
      .meta({ id: 'autoRequest' });

    const registry = createRegistry();
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/autoRequest',
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      autoRequest: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
    });
  });

  it('should handle an auto registered schema component which is referenced in a request and response', () => {
    const zodSchema = z
      .object({
        id: z.string(),
      })
      .meta({ id: 'autoRequestResponse' });

    const registry = createRegistry();
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const responseBody = registry.addResponse(
      {
        description: 'foo',
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/autoRequestResponse',
          },
        },
      },
    });

    expect(responseBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/autoRequestResponseOutput',
          },
        },
      },
      description: 'foo',
    });

    expect(components.schemas).toEqual({
      autoRequestResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
      autoRequestResponseOutput: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should handle an auto registered schema component which is referenced in a request and response with outputId', () => {
    const zodSchema = z
      .object({
        id: z.string(),
      })
      .meta({
        id: 'autoRequestResponseOutputId',
        outputId: 'autoRequestResponseOutput',
      });

    const registry = createRegistry();
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const responseBody = registry.addResponse(
      {
        description: 'foo',
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/autoRequestResponseOutputId',
          },
        },
      },
    });

    expect(responseBody).toEqual<oas31.ResponseObject>({
      description: 'foo',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/autoRequestResponseOutput',
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      autoRequestResponseOutputId: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
      },
      autoRequestResponseOutput: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should handle unregistered lazy schemas', () => {
    type Lazy = Lazy[];
    const zodLazy: z.ZodType<Lazy> = z.lazy(() => zodLazy.array());

    const BasePost = z.object({
      id: z.string(),
      userId: z.string(),
    });

    type Post = z.infer<typeof BasePost> & {
      user?: User;
    };

    const BaseUser = z.object({
      id: z.string(),
    });

    type User = z.infer<typeof BaseUser> & {
      posts?: Post[];
    };

    const PostSchema: ZodType<Post> = BasePost.extend({
      user: z.lazy(() => zodLazyComplex).optional(),
    });

    const zodLazyComplex: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    });

    const registry = createRegistry();
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      ['test'],
    );

    const response = registry.addResponse(
      {
        description: 'A complex lazy schema',
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/__schema0' },
        },
      },
    });

    expect(response).toEqual<oas31.ResponseObject>({
      description: 'A complex lazy schema',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/__schema1' },
        },
      },
    });

    expect(components.schemas).toEqual<Record<string, oas31.SchemaObject>>({
      __schema0: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                user: {
                  $ref: '#/components/schemas/__schema0',
                },
                userId: {
                  type: 'string',
                },
              },
              required: ['id', 'userId'],
            },
          },
        },
        required: ['id'],
      },
      __schema1: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
                user: {
                  $ref: '#/components/schemas/__schema1',
                },
                userId: {
                  type: 'string',
                },
              },
              required: ['id', 'userId'],
              additionalProperties: false,
            },
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should handle registered lazy schemas', () => {
    type Lazy = Lazy[];
    const zodLazy: z.ZodType<Lazy> = z.lazy(() => zodLazy.array());

    const BasePost = z.object({
      id: z.string(),
      userId: z.string(),
    });

    type Post = z.infer<typeof BasePost> & {
      user?: User;
    };

    const BaseUser = z.object({
      id: z.string(),
    });

    type User = z.infer<typeof BaseUser> & {
      posts?: Post[];
    };

    const PostSchema: ZodType<Post> = BasePost.extend({
      user: z.lazy(() => zodLazyComplex).optional(),
    }).meta({ id: 'LazyPost' });

    const zodLazyComplex: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    }).meta({ id: 'LazyUser' });

    const registry = createRegistry();
    const opts = {};

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      ['test'],
    );

    const response = registry.addResponse(
      {
        description: 'A complex lazy schema',
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/LazyUser' },
        },
      },
    });

    expect(response).toEqual<oas31.ResponseObject>({
      description: 'A complex lazy schema',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/LazyUserOutput' },
        },
      },
    });

    expect(components.schemas).toEqual<Record<string, oas31.SchemaObject>>({
      LazyUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          posts: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/LazyPost',
            },
          },
        },
        required: ['id'],
      },
      LazyPost: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          user: {
            $ref: '#/components/schemas/LazyUser',
          },
        },
        required: ['id', 'userId'],
      },
      LazyPostOutput: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          user: {
            $ref: '#/components/schemas/LazyUserOutput',
          },
        },
        required: ['id', 'userId'],
        additionalProperties: false,
      },
      LazyUserOutput: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          posts: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/LazyPostOutput',
            },
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should use the id as the response component name if a schema is not used in a request', () => {
    const zodSchema = z
      .object({
        id: z.string(),
      })
      .meta({ id: 'autoResponse' });

    const registry = createRegistry();
    const opts = {};

    const responseBody = registry.addResponse(
      {
        description: 'A response with an auto registered schema',
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(responseBody).toEqual<oas31.ResponseObject>({
      description: 'A response with an auto registered schema',
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/autoResponse',
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      autoResponse: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
        required: ['id'],
        additionalProperties: false,
      },
    });
  });

  it('should create reused schemas as dynamic components', () => {
    const zodSchema = z.object({
      id: z.string(),
    });

    const registry = createRegistry();

    const opts: CreateDocumentOptions = {
      reused: 'ref',
      cycles: 'ref',
    };

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const requestBody2 = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test2'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/__schema0',
          },
        },
      },
    });

    expect(requestBody2).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/components/schemas/__schema0',
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      __schema0: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    });
  });

  it('should throw when cycles is set to "throw" and a cycle is detected', () => {
    const zodSchema = z.object({
      id: z.string(),
      get cycle() {
        return zodSchema;
      },
    });

    const registry = createRegistry();
    const opts: CreateDocumentOptions = {
      reused: 'ref',
      cycles: 'throw',
    };

    registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    expect(() => {
      createComponents(registry, opts);
    }).toThrowErrorMatchingInlineSnapshot(`
"Cycle detected: #/properties/test > content > application/json > schema/properties/cycle/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs."
`);
  });

  it('supports an alternate schemaRefPath', () => {
    const zodSchema = z
      .object({
        id: z.string(),
      })
      .meta({ id: 'alternateSchemaRefPath' });

    const registry = createRegistry();

    const opts: CreateDocumentOptions = {
      schemaRefPath: '#/definitions/',
    };

    const requestBody = registry.addRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      ['test'],
    );

    const components = createComponents(registry, opts);

    expect(requestBody).toEqual<oas31.RequestBodyObject>({
      content: {
        'application/json': {
          schema: {
            $ref: '#/definitions/alternateSchemaRefPath',
          },
        },
      },
    });

    expect(components.schemas).toEqual({
      alternateSchemaRefPath: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    });
  });
});

describe('addResponse', () => {
  it('should register a response with a manual ID', () => {
    const registry = createRegistry();

    const manualResponse: ZodOpenApiResponseObject = {
      description: 'A response with a manual ID',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    };

    const response = registry.addResponse(manualResponse, ['test'], {
      manualId: 'manualResponse',
    });

    const response2 = registry.addResponse(manualResponse, ['test2']);

    createComponents(registry, {});

    expect(response).toEqual({
      $ref: '#/components/responses/manualResponse',
    });

    expect(response2).toEqual({
      $ref: '#/components/responses/manualResponse',
    });
  });

  it('should register a response with an id', () => {
    const autoResponse: ZodOpenApiResponseObject = {
      id: 'autoResponse',
      description: 'A response with an auto ID',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    };

    const registry = createRegistry();

    const response = registry.addResponse(autoResponse, ['test']);

    const response2 = registry.addResponse(autoResponse, ['test2']);

    createComponents(registry, {});

    expect(response).toEqual({
      $ref: '#/components/responses/autoResponse',
    });

    expect(response2).toEqual({
      $ref: '#/components/responses/autoResponse',
    });
  });
});

describe('addCallback', () => {
  it('should register a callback with a manual ID', () => {
    const registry = createRegistry();

    const manualCallback: oas31.CallbackObject = {
      '/path': {
        post: {
          summary: 'Example callback',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: z.object({
                    message: z.string(),
                  }),
                },
              },
            },
          },
        },
      },
    };

    const callback = registry.addCallback(manualCallback, ['test'], {
      manualId: 'manualCallback',
    });

    const callback2 = registry.addCallback(manualCallback, ['test2']);

    createComponents(registry, {});

    expect(callback).toEqual({
      $ref: '#/components/callbacks/manualCallback',
    });

    expect(callback2).toEqual({
      $ref: '#/components/callbacks/manualCallback',
    });
  });

  it('should register a callback with an id', () => {
    const autoCallback: oas31.CallbackObject = {
      id: 'autoCallback',
      '/path': {
        post: {
          summary: 'Example callback',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: z.object({
                    message: z.string(),
                  }),
                },
              },
            },
          },
        },
      },
    };

    const registry = createRegistry();

    const callback = registry.addCallback(autoCallback, ['test']);

    const callback2 = registry.addCallback(autoCallback, ['test2']);

    createComponents(registry, {});

    expect(callback).toEqual({
      $ref: '#/components/callbacks/autoCallback',
    });

    expect(callback2).toEqual({
      $ref: '#/components/callbacks/autoCallback',
    });
  });
});

describe('addParameter', () => {
  it('should register a parameter with a manual ID', () => {
    const registry = createRegistry();

    const manualParameter: ZodOpenApiParameterObject = z.string().meta({
      param: {
        name: 'test',
        in: 'query',
      },
      description: 'A manual parameter',
    });

    const parameter = registry.addParameter(manualParameter, ['test'], {
      manualId: 'manualParameter',
    });

    const parameter2 = registry.addParameter(manualParameter, ['test2']);

    const components = createComponents(registry, {});

    expect(parameter).toEqual({
      $ref: '#/components/parameters/manualParameter',
    });

    expect(parameter2).toEqual({
      $ref: '#/components/parameters/manualParameter',
    });

    expect(
      Object.fromEntries(registry.components.schemas.input.entries()),
    ).toEqual({
      'test > query > test > schema': {
        schemaObject: {
          type: 'string',
          description: 'A manual parameter',
        },
        zodType: manualParameter,
        source: {
          path: ['test', 'query', 'test', 'schema'],
          type: 'parameter',
          location: {
            in: 'query',
            name: 'test',
          },
        },
      },
    });

    expect(components).toEqual({
      parameters: {
        manualParameter: {
          name: 'test',
          in: 'query',
          description: 'A manual parameter',
          required: true,
          schema: {
            description: 'A manual parameter',
            type: 'string',
          },
        },
      },
    });
  });

  it('should register a parameter with an id', () => {
    const autoParameter: ZodOpenApiParameterObject = z.string().meta({
      param: {
        name: 'test',
        in: 'query',
        id: 'autoParameter',
      },
      description: 'An auto parameter',
    });

    const registry = createRegistry();

    const parameter = registry.addParameter(autoParameter, ['test']);

    const parameter2 = registry.addParameter(autoParameter, ['test2']);

    createComponents(registry, {});

    expect(parameter).toEqual({
      $ref: '#/components/parameters/autoParameter',
    });

    expect(parameter2).toEqual({
      $ref: '#/components/parameters/autoParameter',
    });
  });
});

describe('addRequestBody', () => {
  it('should register a request body with a manual ID', () => {
    const registry = createRegistry();

    const manualRequestBody: ZodOpenApiRequestBodyObject = {
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'A manual request body',
    };

    const requestBody = registry.addRequestBody(manualRequestBody, ['test'], {
      manualId: 'manualRequestBody',
    });

    const requestBody2 = registry.addRequestBody(manualRequestBody, ['test2']);

    createComponents(registry, {});

    expect(requestBody).toEqual({
      $ref: '#/components/requestBodies/manualRequestBody',
    });

    expect(requestBody2).toEqual({
      $ref: '#/components/requestBodies/manualRequestBody',
    });
  });

  it('should register a request body with an id', () => {
    const autoRequestBody: ZodOpenApiRequestBodyObject = {
      id: 'autoRequestBody',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: 'An auto request body',
    };

    const registry = createRegistry();

    const requestBody = registry.addRequestBody(autoRequestBody, ['test']);

    const requestBody2 = registry.addRequestBody(autoRequestBody, ['test2']);

    createComponents(registry, {});

    expect(requestBody).toEqual({
      $ref: '#/components/requestBodies/autoRequestBody',
    });

    expect(requestBody2).toEqual({
      $ref: '#/components/requestBodies/autoRequestBody',
    });
  });
});

describe('addPathItem', () => {
  it('should register a path item with a manual ID', () => {
    const registry = createRegistry();

    const manualPathItem: ZodOpenApiPathItemObject = {
      get: {
        summary: 'A manual path item',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: z.object({
                  message: z.string(),
                }),
              },
            },
          },
        },
      },
    };

    const pathItem = registry.addPathItem(manualPathItem, ['test'], {
      manualId: 'manualPathItem',
    });

    const pathItem2 = registry.addPathItem(manualPathItem, ['test2']);

    createComponents(registry, {});

    expect(pathItem).toEqual({
      $ref: '#/components/pathItems/manualPathItem',
    });

    expect(pathItem2).toEqual({
      $ref: '#/components/pathItems/manualPathItem',
    });
  });

  it('should register a path item with an id', () => {
    const autoPathItem: ZodOpenApiPathItemObject = {
      id: 'autoPathItem',
      get: {
        summary: 'An auto path item',
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: z.object({
                  message: z.string(),
                }),
              },
            },
          },
        },
      },
    };

    const registry = createRegistry();

    const pathItem = registry.addPathItem(autoPathItem, ['test']);

    const pathItem2 = registry.addPathItem(autoPathItem, ['test2']);

    createComponents(registry, {});

    expect(pathItem).toEqual({
      $ref: '#/components/pathItems/autoPathItem',
    });

    expect(pathItem2).toEqual({
      $ref: '#/components/pathItems/autoPathItem',
    });
  });
});

describe('addHeader', () => {
  it('should register a header with a manual ID', () => {
    const registry = createRegistry();

    const manualHeader: ZodOpenApiHeaderObject = z.string().meta({
      header: {
        description: 'A manual header',
      },
    });

    const header = registry.addHeader(manualHeader, ['test'], {
      manualId: 'manualHeader',
    });

    const header2 = registry.addHeader(manualHeader, ['test2']);

    createComponents(registry, {});

    expect(header).toEqual({
      $ref: '#/components/headers/manualHeader',
    });

    expect(header2).toEqual({
      $ref: '#/components/headers/manualHeader',
    });
  });

  it('should register a header with an id', () => {
    const autoHeader: ZodOpenApiHeaderObject = z.string().meta({
      header: {
        description: 'An auto header',
        id: 'autoHeader',
      },
    });

    const registry = createRegistry();

    const header = registry.addHeader(autoHeader, ['test']);

    const header2 = registry.addHeader(autoHeader, ['test2']);

    createComponents(registry, {});

    expect(header).toEqual({
      $ref: '#/components/headers/autoHeader',
    });

    expect(header2).toEqual({
      $ref: '#/components/headers/autoHeader',
    });
  });
});
