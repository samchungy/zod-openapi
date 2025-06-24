import z, { type ZodType } from 'zod/v4';

import { type ZodOpenApiObject, createDocument } from './document';

describe('createDocument', () => {
  it('should render a simple ZodOpenApiObject', () => {
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
                  "additionalProperties": false,
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

  it('should render registered components', () => {
    const registered = z.object({
      a: z.string().meta({ id: 'a' }),
    });
    const registeredPath = z.object({
      b: z.string().meta({ param: { id: 'b' } }),
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
                  'my-header': z.string().meta({ header: { id: 'my-header' } }),
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
                          "additionalProperties": false,
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
                  "additionalProperties": false,
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

  it('should render a lazy objects with registered schemas', () => {
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
    }).meta({ id: 'post' });

    const zodLazyComplex: ZodType<User> = BaseUser.extend({
      posts: z.array(z.lazy(() => PostSchema)).optional(),
    }).meta({ id: 'user' });

    const complexZodOpenApiObject: ZodOpenApiObject = {
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/posts': {
          get: {
            responses: {
              '200': {
                description: '200 OK',
                content: {
                  'application/json': {
                    schema: PostSchema,
                  },
                },
              },
            },
          },
        },
      },
    };

    const document = createDocument(complexZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
{
  "components": {
    "schemas": {
      "post": {
        "additionalProperties": false,
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
      "user": {
        "additionalProperties": false,
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
    "/posts": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/post",
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

  it('should render a lazy objects without registered schemas', () => {
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

    const complexZodOpenApiObject: ZodOpenApiObject = {
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/posts': {
          get: {
            responses: {
              '200': {
                description: '200 OK',
                content: {
                  'application/json': {
                    schema: PostSchema,
                  },
                },
              },
            },
          },
        },
      },
    };

    const document = createDocument(complexZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
{
  "components": {
    "schemas": {
      "__schema0": {
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
          },
          "user": {
            "additionalProperties": false,
            "properties": {
              "id": {
                "type": "string",
              },
              "posts": {
                "items": {
                  "$ref": "#/components/schemas/__schema0",
                },
                "type": "array",
              },
            },
            "required": [
              "id",
            ],
            "type": "object",
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
    },
  },
  "info": {
    "title": "My API",
    "version": "1.0.0",
  },
  "openapi": "3.1.0",
  "paths": {
    "/posts": {
      "get": {
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/__schema0",
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
