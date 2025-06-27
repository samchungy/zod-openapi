import { type ZodType, z } from 'zod/v4';

import type { oas31 } from '../openapi3-ts/dist';

import { createComponents, createRegistry } from './components';
import type { CreateDocumentOptions } from './document';
import { createRequestBody } from './requestBody';
import { createResponse } from './responses';

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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const nestedRequestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: nestedSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: manual,
          },
        },
      },
      {
        registry,
        io: 'input',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: z.object({
              a: manual2,
            }),
          },
        },
      },
      {
        registry,
        io: 'input',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: z.object({
              a: manual3,
            }),
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const responseBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: z.object({
              b: manual3,
            }),
          },
        },
      },
      {
        registry,
        io: 'output',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const responseBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'output',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const responseBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'output',
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

    expect(responseBody).toEqual<oas31.RequestBodyObject>({
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const response = createResponse(
      {
        description: 'A complex lazy schema',
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      {
        registry,
        io: 'output',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const response = createResponse(
      {
        description: 'A complex lazy schema',
        content: {
          'application/json': {
            schema: zodLazyComplex,
          },
        },
      },
      {
        registry,
        io: 'output',
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

    const responseBody = createResponse(
      {
        description: 'A response with an auto registered schema',
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'output',
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

    const requestBody = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    const requestBody2 = createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
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

    createRequestBody(
      {
        content: {
          'application/json': {
            schema: zodSchema,
          },
        },
      },
      {
        registry,
        io: 'input',
      },
      ['test'],
    );

    expect(() => {
      createComponents(registry, opts);
    }).toThrowErrorMatchingInlineSnapshot(`
"Cycle detected: #/properties/test > content > application/json/properties/cycle/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs."
`);
  });
});
