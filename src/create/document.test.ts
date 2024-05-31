import '../extend';
import { type ZodType, z } from 'zod';

import {
  type ZodOpenApiCallbackObject,
  type ZodOpenApiObject,
  createDocument,
} from './document';

const schema = z.object({
  a: z.string(),
});
const path = z.object({ b: z.string() });
const simpleZodOpenApiObject: ZodOpenApiObject = {
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  openapi: '3.1.0',
  paths: {
    '/jobs': {
      get: {
        requestParams: {
          path,
        },
        requestBody: {
          content: {
            'application/json': {
              schema,
            },
          },
        },
        responses: {
          '200': {
            description: '200 OK',
            content: {
              'application/json': {
                schema,
              },
            },
          },
        },
      },
    },
  },
};

const registered = z.object({
  a: z.string().openapi({ ref: 'a' }),
});
const registeredPath = z.object({
  b: z.string().openapi({ param: { ref: 'b' } }),
});
const registeredZodOpenApiObject: ZodOpenApiObject = {
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  openapi: '3.1.0',
  paths: {
    '/jobs': {
      get: {
        requestParams: {
          path: registeredPath,
        },
        requestBody: {
          content: {
            'application/json': {
              schema: registered,
            },
          },
        },
        responses: {
          '200': {
            description: '200 OK',
            content: {
              'application/json': {
                schema: registered,
              },
            },
            headers: z.object({
              'my-header': z.string().openapi({ header: { ref: 'my-header' } }),
            }),
          },
        },
        callbacks: {
          onData: {
            '{$request.query.callbackUrl}/data': {
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: registered,
                    },
                  },
                },
                responses: {
                  '202': {
                    description: '200 OK',
                    content: {
                      'application/json': {
                        schema: registered,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

const baseObject = z
  .object({
    a: z.string(),
  })
  .openapi({ ref: 'b' });
const manual = z.boolean();
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
}).openapi({ ref: 'post' });

const zodLazyComplex: ZodType<User> = BaseUser.extend({
  posts: z.array(z.lazy(() => PostSchema)).optional(),
}).openapi({ ref: 'user' });

const registeredCallback: ZodOpenApiCallbackObject = {
  ref: 'callback',
  '{$request.query.callbackUrl}/data': {
    post: {
      requestBody: {
        content: {
          'application/json': {
            schema: z.object({ a: z.string() }),
          },
        },
      },
      responses: {
        '202': {
          description: '202 OK',
        },
      },
    },
  },
};

const complex = z.object({
  a: z.string().openapi({ ref: 'a' }),
  b: baseObject,
  c: baseObject.optional(),
  d: baseObject.extend({ d: z.string().nullable() }).openapi({ ref: 'c' }),
  e: z.discriminatedUnion('type', [
    z.object({ type: z.literal('a') }).openapi({ ref: 'union-a' }),
    z.object({ type: z.literal('b') }).openapi({ ref: 'union-b' }),
  ]),
  f: z.tuple([z.string(), z.number(), manual]),
  g: zodLazy,
  h: zodLazyComplex,
});
const complexZodOpenApiObject: ZodOpenApiObject = {
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  openapi: '3.1.0',
  paths: {
    '/jobs': {
      get: {
        requestParams: {
          path: registeredPath,
        },
        requestBody: {
          content: {
            'application/json': {
              schema: complex,
            },
          },
        },
        responses: {
          '200': {
            description: '200 OK',
            content: {
              'application/json': {
                schema: complex,
              },
            },
            headers: z.object({
              'my-header': z.string().openapi({ header: { ref: 'my-header' } }),
            }),
          },
        },
        callbacks: {
          onData: registeredCallback,
        },
      },
    },
  },
  components: {
    schemas: {
      manual,
      lazy: zodLazy,
    },
  },
};

describe('createDocument', () => {
  it('should generate a JSON document string', () => {
    const document = createDocument(simpleZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
      {
        "info": {
          "title": "My API",
          "version": "1.0.0",
        },
        "openapi": "3.1.0",
        "paths": {
          "/jobs": {
            "get": {
              "parameters": [
                {
                  "in": "path",
                  "name": "b",
                  "required": true,
                  "schema": {
                    "type": "string",
                  },
                },
              ],
              "requestBody": {
                "content": {
                  "application/json": {
                    "schema": {
                      "properties": {
                        "a": {
                          "type": "string",
                        },
                      },
                      "required": [
                        "a",
                      ],
                      "type": "object",
                    },
                  },
                },
              },
              "responses": {
                "200": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "properties": {
                          "a": {
                            "type": "string",
                          },
                        },
                        "required": [
                          "a",
                        ],
                        "type": "object",
                      },
                    },
                  },
                  "description": "200 OK",
                },
              },
            },
          },
        },
      }
    `);
  });

  it('should generate a JSON document string with components', () => {
    const document = createDocument(registeredZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
      {
        "components": {
          "headers": {
            "my-header": {
              "required": true,
              "schema": {
                "type": "string",
              },
            },
          },
          "parameters": {
            "b": {
              "in": "path",
              "name": "b",
              "required": true,
              "schema": {
                "type": "string",
              },
            },
          },
          "schemas": {
            "a": {
              "type": "string",
            },
          },
        },
        "info": {
          "title": "My API",
          "version": "1.0.0",
        },
        "openapi": "3.1.0",
        "paths": {
          "/jobs": {
            "get": {
              "callbacks": {
                "onData": {
                  "{$request.query.callbackUrl}/data": {
                    "post": {
                      "requestBody": {
                        "content": {
                          "application/json": {
                            "schema": {
                              "properties": {
                                "a": {
                                  "$ref": "#/components/schemas/a",
                                },
                              },
                              "required": [
                                "a",
                              ],
                              "type": "object",
                            },
                          },
                        },
                      },
                      "responses": {
                        "202": {
                          "content": {
                            "application/json": {
                              "schema": {
                                "properties": {
                                  "a": {
                                    "$ref": "#/components/schemas/a",
                                  },
                                },
                                "required": [
                                  "a",
                                ],
                                "type": "object",
                              },
                            },
                          },
                          "description": "200 OK",
                        },
                      },
                    },
                  },
                },
              },
              "parameters": [
                {
                  "$ref": "#/components/parameters/b",
                },
              ],
              "requestBody": {
                "content": {
                  "application/json": {
                    "schema": {
                      "properties": {
                        "a": {
                          "$ref": "#/components/schemas/a",
                        },
                      },
                      "required": [
                        "a",
                      ],
                      "type": "object",
                    },
                  },
                },
              },
              "responses": {
                "200": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "properties": {
                          "a": {
                            "$ref": "#/components/schemas/a",
                          },
                        },
                        "required": [
                          "a",
                        ],
                        "type": "object",
                      },
                    },
                  },
                  "description": "200 OK",
                  "headers": {
                    "my-header": {
                      "$ref": "#/components/headers/my-header",
                    },
                  },
                },
              },
            },
          },
        },
      }
    `);
  });

  it('should generate a complex JSON document string with components', () => {
    const document = createDocument(complexZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
{
  "components": {
    "callbacks": {
      "callback": {
        "{$request.query.callbackUrl}/data": {
          "post": {
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "a": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "a",
                    ],
                    "type": "object",
                  },
                },
              },
            },
            "responses": {
              "202": {
                "description": "202 OK",
              },
            },
          },
        },
      },
    },
    "headers": {
      "my-header": {
        "required": true,
        "schema": {
          "type": "string",
        },
      },
    },
    "parameters": {
      "b": {
        "in": "path",
        "name": "b",
        "required": true,
        "schema": {
          "type": "string",
        },
      },
    },
    "schemas": {
      "a": {
        "type": "string",
      },
      "b": {
        "properties": {
          "a": {
            "type": "string",
          },
        },
        "required": [
          "a",
        ],
        "type": "object",
      },
      "c": {
        "allOf": [
          {
            "$ref": "#/components/schemas/b",
          },
        ],
        "properties": {
          "d": {
            "type": [
              "string",
              "null",
            ],
          },
        },
        "required": [
          "d",
        ],
        "type": "object",
      },
      "lazy": {
        "items": {
          "$ref": "#/components/schemas/lazy",
        },
        "type": "array",
      },
      "manual": {
        "type": "boolean",
      },
      "post": {
        "properties": {
          "id": {
            "type": "string",
          },
          "user": {
            "$ref": "#/components/schemas/user",
          },
          "userId": {
            "type": "string",
          },
        },
        "required": [
          "id",
          "userId",
        ],
        "type": "object",
      },
      "union-a": {
        "properties": {
          "type": {
            "const": "a",
            "type": "string",
          },
        },
        "required": [
          "type",
        ],
        "type": "object",
      },
      "union-b": {
        "properties": {
          "type": {
            "const": "b",
            "type": "string",
          },
        },
        "required": [
          "type",
        ],
        "type": "object",
      },
      "user": {
        "properties": {
          "id": {
            "type": "string",
          },
          "posts": {
            "items": {
              "$ref": "#/components/schemas/post",
            },
            "type": "array",
          },
        },
        "required": [
          "id",
        ],
        "type": "object",
      },
    },
  },
  "info": {
    "title": "My API",
    "version": "1.0.0",
  },
  "openapi": "3.1.0",
  "paths": {
    "/jobs": {
      "get": {
        "callbacks": {
          "onData": {
            "$ref": "#/components/callbacks/callback",
          },
        },
        "parameters": [
          {
            "$ref": "#/components/parameters/b",
          },
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "properties": {
                  "a": {
                    "$ref": "#/components/schemas/a",
                  },
                  "b": {
                    "$ref": "#/components/schemas/b",
                  },
                  "c": {
                    "$ref": "#/components/schemas/b",
                  },
                  "d": {
                    "$ref": "#/components/schemas/c",
                  },
                  "e": {
                    "discriminator": {
                      "mapping": {
                        "a": "#/components/schemas/union-a",
                        "b": "#/components/schemas/union-b",
                      },
                      "propertyName": "type",
                    },
                    "oneOf": [
                      {
                        "$ref": "#/components/schemas/union-a",
                      },
                      {
                        "$ref": "#/components/schemas/union-b",
                      },
                    ],
                  },
                  "f": {
                    "maxItems": 3,
                    "minItems": 3,
                    "prefixItems": [
                      {
                        "type": "string",
                      },
                      {
                        "type": "number",
                      },
                      {
                        "$ref": "#/components/schemas/manual",
                      },
                    ],
                    "type": "array",
                  },
                  "g": {
                    "$ref": "#/components/schemas/lazy",
                  },
                  "h": {
                    "$ref": "#/components/schemas/user",
                  },
                },
                "required": [
                  "a",
                  "b",
                  "d",
                  "e",
                  "f",
                  "g",
                  "h",
                ],
                "type": "object",
              },
            },
          },
        },
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "properties": {
                    "a": {
                      "$ref": "#/components/schemas/a",
                    },
                    "b": {
                      "$ref": "#/components/schemas/b",
                    },
                    "c": {
                      "$ref": "#/components/schemas/b",
                    },
                    "d": {
                      "$ref": "#/components/schemas/c",
                    },
                    "e": {
                      "discriminator": {
                        "mapping": {
                          "a": "#/components/schemas/union-a",
                          "b": "#/components/schemas/union-b",
                        },
                        "propertyName": "type",
                      },
                      "oneOf": [
                        {
                          "$ref": "#/components/schemas/union-a",
                        },
                        {
                          "$ref": "#/components/schemas/union-b",
                        },
                      ],
                    },
                    "f": {
                      "maxItems": 3,
                      "minItems": 3,
                      "prefixItems": [
                        {
                          "type": "string",
                        },
                        {
                          "type": "number",
                        },
                        {
                          "$ref": "#/components/schemas/manual",
                        },
                      ],
                      "type": "array",
                    },
                    "g": {
                      "$ref": "#/components/schemas/lazy",
                    },
                    "h": {
                      "$ref": "#/components/schemas/user",
                    },
                  },
                  "required": [
                    "a",
                    "b",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "200 OK",
            "headers": {
              "my-header": {
                "$ref": "#/components/headers/my-header",
              },
            },
          },
        },
      },
    },
  },
}
`);
  });

  it('should generate a complex JSON document string with components in 3.0.0', () => {
    const document = createDocument({
      ...complexZodOpenApiObject,
      openapi: '3.0.0',
    });

    expect(document).toMatchInlineSnapshot(`
{
  "components": {
    "callbacks": {
      "callback": {
        "{$request.query.callbackUrl}/data": {
          "post": {
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "properties": {
                      "a": {
                        "type": "string",
                      },
                    },
                    "required": [
                      "a",
                    ],
                    "type": "object",
                  },
                },
              },
            },
            "responses": {
              "202": {
                "description": "202 OK",
              },
            },
          },
        },
      },
    },
    "headers": {
      "my-header": {
        "required": true,
        "schema": {
          "type": "string",
        },
      },
    },
    "parameters": {
      "b": {
        "in": "path",
        "name": "b",
        "required": true,
        "schema": {
          "type": "string",
        },
      },
    },
    "schemas": {
      "a": {
        "type": "string",
      },
      "b": {
        "properties": {
          "a": {
            "type": "string",
          },
        },
        "required": [
          "a",
        ],
        "type": "object",
      },
      "c": {
        "allOf": [
          {
            "$ref": "#/components/schemas/b",
          },
        ],
        "properties": {
          "d": {
            "nullable": true,
            "type": "string",
          },
        },
        "required": [
          "d",
        ],
        "type": "object",
      },
      "lazy": {
        "items": {
          "$ref": "#/components/schemas/lazy",
        },
        "type": "array",
      },
      "manual": {
        "type": "boolean",
      },
      "post": {
        "properties": {
          "id": {
            "type": "string",
          },
          "user": {
            "$ref": "#/components/schemas/user",
          },
          "userId": {
            "type": "string",
          },
        },
        "required": [
          "id",
          "userId",
        ],
        "type": "object",
      },
      "union-a": {
        "properties": {
          "type": {
            "enum": [
              "a",
            ],
            "type": "string",
          },
        },
        "required": [
          "type",
        ],
        "type": "object",
      },
      "union-b": {
        "properties": {
          "type": {
            "enum": [
              "b",
            ],
            "type": "string",
          },
        },
        "required": [
          "type",
        ],
        "type": "object",
      },
      "user": {
        "properties": {
          "id": {
            "type": "string",
          },
          "posts": {
            "items": {
              "$ref": "#/components/schemas/post",
            },
            "type": "array",
          },
        },
        "required": [
          "id",
        ],
        "type": "object",
      },
    },
  },
  "info": {
    "title": "My API",
    "version": "1.0.0",
  },
  "openapi": "3.0.0",
  "paths": {
    "/jobs": {
      "get": {
        "callbacks": {
          "onData": {
            "$ref": "#/components/callbacks/callback",
          },
        },
        "parameters": [
          {
            "$ref": "#/components/parameters/b",
          },
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "properties": {
                  "a": {
                    "$ref": "#/components/schemas/a",
                  },
                  "b": {
                    "$ref": "#/components/schemas/b",
                  },
                  "c": {
                    "$ref": "#/components/schemas/b",
                  },
                  "d": {
                    "$ref": "#/components/schemas/c",
                  },
                  "e": {
                    "discriminator": {
                      "mapping": {
                        "a": "#/components/schemas/union-a",
                        "b": "#/components/schemas/union-b",
                      },
                      "propertyName": "type",
                    },
                    "oneOf": [
                      {
                        "$ref": "#/components/schemas/union-a",
                      },
                      {
                        "$ref": "#/components/schemas/union-b",
                      },
                    ],
                  },
                  "f": {
                    "items": {
                      "oneOf": [
                        {
                          "type": "string",
                        },
                        {
                          "type": "number",
                        },
                        {
                          "$ref": "#/components/schemas/manual",
                        },
                      ],
                    },
                    "maxItems": 3,
                    "minItems": 3,
                    "type": "array",
                  },
                  "g": {
                    "$ref": "#/components/schemas/lazy",
                  },
                  "h": {
                    "$ref": "#/components/schemas/user",
                  },
                },
                "required": [
                  "a",
                  "b",
                  "d",
                  "e",
                  "f",
                  "g",
                  "h",
                ],
                "type": "object",
              },
            },
          },
        },
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "properties": {
                    "a": {
                      "$ref": "#/components/schemas/a",
                    },
                    "b": {
                      "$ref": "#/components/schemas/b",
                    },
                    "c": {
                      "$ref": "#/components/schemas/b",
                    },
                    "d": {
                      "$ref": "#/components/schemas/c",
                    },
                    "e": {
                      "discriminator": {
                        "mapping": {
                          "a": "#/components/schemas/union-a",
                          "b": "#/components/schemas/union-b",
                        },
                        "propertyName": "type",
                      },
                      "oneOf": [
                        {
                          "$ref": "#/components/schemas/union-a",
                        },
                        {
                          "$ref": "#/components/schemas/union-b",
                        },
                      ],
                    },
                    "f": {
                      "items": {
                        "oneOf": [
                          {
                            "type": "string",
                          },
                          {
                            "type": "number",
                          },
                          {
                            "$ref": "#/components/schemas/manual",
                          },
                        ],
                      },
                      "maxItems": 3,
                      "minItems": 3,
                      "type": "array",
                    },
                    "g": {
                      "$ref": "#/components/schemas/lazy",
                    },
                    "h": {
                      "$ref": "#/components/schemas/user",
                    },
                  },
                  "required": [
                    "a",
                    "b",
                    "d",
                    "e",
                    "f",
                    "g",
                    "h",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "200 OK",
            "headers": {
              "my-header": {
                "$ref": "#/components/headers/my-header",
              },
            },
          },
        },
      },
    },
  },
}
`);
  });

  it('Supports circular schemas declared in components.schemas', () => {
    const BasePost2 = z.object({
      id: z.string(),
      userId: z.string(),
    });

    type Post2 = z.infer<typeof BasePost2> & {
      user?: User;
    };

    const BaseUser2 = z.object({
      id: z.string(),
    });

    type User2 = z.infer<typeof BaseUser2> & {
      posts?: Post[];
    };

    const PostSchema2: ZodType<Post2, z.ZodObjectDef> = BasePost2.extend({
      user: z.lazy(() => UserSchema2).optional(),
      user_fields: z.lazy(() => PartialUserSchema2).optional(),
    }); // no .openapi() for this test!
    const PartialPostSchema2: ZodType<Partial<Post2>> = (
      PostSchema2 as any
    ).partial();

    const PostArray = z.array(z.lazy(() => PostSchema2));

    const UserSchema2: ZodType<User2> = BaseUser.extend({
      posts: PostArray.optional(),
      posts_fields: z.array(z.lazy(() => PartialPostSchema2)).optional(),
      comments: PostArray.optional(),
      comments_fields: z.array(z.lazy(() => PartialPostSchema2)).optional(),
    }); // no .openapi() for this test!
    const PartialUserSchema2: ZodType<Partial<User2>> = (
      UserSchema2 as any
    ).partial();

    const document = createDocument({
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      components: {
        schemas: {
          User: UserSchema2,
          PartialUser: PartialUserSchema2,
          Post: PostSchema2,
          PartialPost: PartialPostSchema2,
        },
      },
      paths: {
        '/user': {
          get: {
            responses: {
              '200': {
                description: '200 OK',
                content: {
                  'application/json': {
                    schema: UserSchema2,
                  },
                },
              },
            },
          },
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: UserSchema2,
                },
              },
            },
            responses: {
              '200': {
                description: '200 OK',
                content: {
                  'application/json': {
                    schema: UserSchema2,
                  },
                },
              },
            },
          },
        },
        '/post': {
          get: {
            responses: {
              '200': {
                description: '200 OK',
                content: {
                  'application/json': {
                    schema: PostSchema2,
                  },
                },
              },
            },
          },
        },
      },
    });

    expect(document).toMatchInlineSnapshot(`
      {
        "components": {
          "schemas": {
            "PartialPost": {
              "properties": {
                "id": {
                  "type": "string",
                },
                "user": {
                  "$ref": "#/components/schemas/User",
                },
                "userId": {
                  "type": "string",
                },
                "user_fields": {
                  "$ref": "#/components/schemas/PartialUser",
                },
              },
              "type": "object",
            },
            "PartialUser": {
              "properties": {
                "comments": {
                  "items": {
                    "$ref": "#/components/schemas/Post",
                  },
                  "type": "array",
                },
                "comments_fields": {
                  "items": {
                    "$ref": "#/components/schemas/PartialPost",
                  },
                  "type": "array",
                },
                "id": {
                  "type": "string",
                },
                "posts": {
                  "items": {
                    "$ref": "#/components/schemas/Post",
                  },
                  "type": "array",
                },
                "posts_fields": {
                  "items": {
                    "$ref": "#/components/schemas/PartialPost",
                  },
                  "type": "array",
                },
              },
              "type": "object",
            },
            "Post": {
              "properties": {
                "id": {
                  "type": "string",
                },
                "user": {
                  "$ref": "#/components/schemas/User",
                },
                "userId": {
                  "type": "string",
                },
                "user_fields": {
                  "$ref": "#/components/schemas/PartialUser",
                },
              },
              "required": [
                "id",
                "userId",
              ],
              "type": "object",
            },
            "User": {
              "properties": {
                "comments": {
                  "items": {
                    "$ref": "#/components/schemas/Post",
                  },
                  "type": "array",
                },
                "comments_fields": {
                  "items": {
                    "$ref": "#/components/schemas/PartialPost",
                  },
                  "type": "array",
                },
                "id": {
                  "type": "string",
                },
                "posts": {
                  "items": {
                    "$ref": "#/components/schemas/Post",
                  },
                  "type": "array",
                },
                "posts_fields": {
                  "items": {
                    "$ref": "#/components/schemas/PartialPost",
                  },
                  "type": "array",
                },
              },
              "required": [
                "id",
              ],
              "type": "object",
            },
          },
        },
        "info": {
          "title": "My API",
          "version": "1.0.0",
        },
        "openapi": "3.1.0",
        "paths": {
          "/post": {
            "get": {
              "responses": {
                "200": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/Post",
                      },
                    },
                  },
                  "description": "200 OK",
                },
              },
            },
          },
          "/user": {
            "get": {
              "responses": {
                "200": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/User",
                      },
                    },
                  },
                  "description": "200 OK",
                },
              },
            },
            "post": {
              "requestBody": {
                "content": {
                  "application/json": {
                    "schema": {
                      "$ref": "#/components/schemas/User",
                    },
                  },
                },
              },
              "responses": {
                "200": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "$ref": "#/components/schemas/User",
                      },
                    },
                  },
                  "description": "200 OK",
                },
              },
            },
          },
        },
      }
    `);
  });
});
