import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import {
  type ZodOpenApiObject,
  type ZodOpenApiResponseObject,
  createDocument,
} from './document.js';

describe('createDocument', () => {
  it('should render a document with paths, webhooks, and components', () => {
    const document = createDocument({
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/jobs': {
          get: {
            responses: {
              '200': {
                description: '200 OK',
              },
            },
          },
        },
      },
      webhooks: {
        '/webhook': {
          post: {
            responses: {
              '200': {
                description: 'Webhook received',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          MySchema: z.object({
            id: z.string(),
          }),
        },
      },
    });

    expect(document).toMatchInlineSnapshot(`
{
  "components": {
    "schemas": {
      "MySchema": {
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
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
        "responses": {
          "200": {
            "description": "200 OK",
          },
        },
      },
    },
  },
  "webhooks": {
    "/webhook": {
      "post": {
        "responses": {
          "200": {
            "description": "Webhook received",
          },
        },
      },
    },
  },
}
`);
  });

  it('should render a path with parameters, request body, headers and responses', () => {
    const document = createDocument({
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/users/{id}': {
          get: {
            requestBody: {
              content: {
                'application/json': {
                  schema: z.object({
                    name: z.string(),
                  }),
                },
              },
            },
            requestParams: {
              cookie: z.object({
                sessionId: z.string(),
              }),
              header: z.object({
                Authorization: z.string(),
              }),
              path: z.object({
                id: z.string(),
              }),
              query: z.object({
                search: z.string().optional(),
              }),
            },
            responses: {
              '200': {
                description: 'User found',
                headers: z.object({
                  'X-RateLimit-Limit': z.string().optional(),
                }),
                content: {
                  'application/json': {
                    schema: z.object({
                      id: z.string(),
                      name: z.string(),
                    }),
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
  "info": {
    "title": "My API",
    "version": "1.0.0",
  },
  "openapi": "3.1.0",
  "paths": {
    "/users/{id}": {
      "get": {
        "parameters": [
          {
            "in": "cookie",
            "name": "sessionId",
            "required": true,
            "schema": {
              "type": "string",
            },
          },
          {
            "in": "header",
            "name": "Authorization",
            "required": true,
            "schema": {
              "type": "string",
            },
          },
          {
            "in": "path",
            "name": "id",
            "required": true,
            "schema": {
              "type": "string",
            },
          },
          {
            "in": "query",
            "name": "search",
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
                  "name": {
                    "type": "string",
                  },
                },
                "required": [
                  "name",
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
                    "id": {
                      "type": "string",
                    },
                    "name": {
                      "type": "string",
                    },
                  },
                  "required": [
                    "id",
                    "name",
                  ],
                  "type": "object",
                },
              },
            },
            "description": "User found",
            "headers": {
              "X-RateLimit-Limit": {
                "schema": {
                  "type": "string",
                },
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

  it('should render a document with registered components', () => {
    const document = createDocument({
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.1.0',
      paths: {
        '/users/{id}': {
          id: 'registeredPath',
          get: {
            requestBody: {
              id: 'registeredRequestBody',
              content: {
                'application/json': {
                  schema: z
                    .object({
                      name: z.string(),
                    })
                    .meta({ id: 'registeredRequestBodySchema' }),
                },
              },
            },
            requestParams: {
              cookie: z.object({
                sessionId: z
                  .string()
                  .meta({ param: { id: 'registeredCookie' } }),
              }),
              header: z.object({
                Authorization: z.string(),
              }),
              path: z.object({
                id: z.string(),
              }),
              query: z.object({
                search: z.string().optional(),
              }),
            },
            callbacks: {
              onData: {
                id: 'registeredCallback',
                '{$request.query.callbackUrl}/data': {
                  post: {
                    requestBody: {
                      content: {
                        'application/json': {
                          schema: z
                            .object({
                              data: z.string(),
                            })
                            .meta({
                              id: 'registeredCallbackRequestBodySchema',
                            }),
                        },
                      },
                    },
                    responses: {
                      '200': {
                        description: 'Callback received',
                      },
                    },
                  },
                },
              },
            },
            responses: {
              '200': {
                id: 'registeredResponse',
                description: 'User found',
                headers: z.object({
                  'X-RateLimit-Limit': z
                    .string()
                    .optional()
                    .meta({
                      header: { id: 'registeredHeader' },
                    }),
                }),
                content: {
                  'application/json': {
                    schema: z
                      .object({
                        id: z.string(),
                        name: z.string(),
                      })
                      .meta({
                        id: 'registeredResponseSchema',
                      }),
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
    "callbacks": {
      "registeredCallback": {
        "{$request.query.callbackUrl}/data": {
          "post": {
            "requestBody": {
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/registeredCallbackRequestBodySchema",
                  },
                },
              },
            },
            "responses": {
              "200": {
                "description": "Callback received",
              },
            },
          },
        },
      },
    },
    "headers": {
      "registeredHeader": {
        "schema": {
          "type": "string",
        },
      },
    },
    "parameters": {
      "registeredCookie": {
        "in": "cookie",
        "name": "sessionId",
        "required": true,
        "schema": {
          "type": "string",
        },
      },
    },
    "pathItems": {
      "registeredPath": {
        "get": {
          "callbacks": {
            "onData": {
              "$ref": "#/components/callbacks/registeredCallback",
            },
          },
          "parameters": [
            {
              "$ref": "#/components/parameters/registeredCookie",
            },
            {
              "in": "header",
              "name": "Authorization",
              "required": true,
              "schema": {
                "type": "string",
              },
            },
            {
              "in": "path",
              "name": "id",
              "required": true,
              "schema": {
                "type": "string",
              },
            },
            {
              "in": "query",
              "name": "search",
              "schema": {
                "type": "string",
              },
            },
          ],
          "requestBody": {
            "$ref": "#/components/requestBodies/registeredRequestBody",
          },
          "responses": {
            "200": {
              "$ref": "#/components/responses/registeredResponse",
            },
          },
        },
      },
    },
    "requestBodies": {
      "registeredRequestBody": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/registeredRequestBodySchema",
            },
          },
        },
      },
    },
    "responses": {
      "registeredResponse": {
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/registeredResponseSchema",
            },
          },
        },
        "description": "User found",
        "headers": {
          "X-RateLimit-Limit": {
            "$ref": "#/components/headers/registeredHeader",
          },
        },
      },
    },
    "schemas": {
      "registeredCallbackRequestBodySchema": {
        "properties": {
          "data": {
            "type": "string",
          },
        },
        "required": [
          "data",
        ],
        "type": "object",
      },
      "registeredRequestBodySchema": {
        "properties": {
          "name": {
            "type": "string",
          },
        },
        "required": [
          "name",
        ],
        "type": "object",
      },
      "registeredResponseSchema": {
        "additionalProperties": false,
        "properties": {
          "id": {
            "type": "string",
          },
          "name": {
            "type": "string",
          },
        },
        "required": [
          "id",
          "name",
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
    "/users/{id}": {
      "$ref": "#/components/pathItems/registeredPath",
    },
  },
}
`);
  });

  it('should work allow manual ids', () => {
    const response: ZodOpenApiResponseObject = {
      description: '200 OK',
      content: {
        'application/json': {
          schema: z.object({ a: z.string() }),
        },
      },
      id: 'some-response',
    };

    const options: ZodOpenApiObject = {
      openapi: '3.1.0',
      info: {
        title: 'some title',
        version: '1.0.0',
      },
      paths: {
        '/some-path': {
          get: {
            summary: 'some summary',
            description: 'some description',
            responses: {
              '200': response,
            },
          },
        },
      },
      components: {
        responses: {
          'some-response': response,
        },
      },
    };

    const document = createDocument(options);

    expect(document).toMatchInlineSnapshot(`
      {
        "components": {
          "responses": {
            "some-response": {
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
        "info": {
          "title": "some title",
          "version": "1.0.0",
        },
        "openapi": "3.1.0",
        "paths": {
          "/some-path": {
            "get": {
              "description": "some description",
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
              "summary": "some summary",
            },
          },
        },
      }
    `);
  });

  it('should support OpenAPI 3.0.0', () => {
    const result = createDocument({
      info: {
        title: 'My API',
        version: '1.0.0',
      },
      openapi: '3.0.0',
      paths: {
        '/jobs': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: z.object({
                      id: z.string().nullable(),
                    }),
                  },
                },
                description: '200 OK',
              },
            },
          },
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "info": {
          "title": "My API",
          "version": "1.0.0",
        },
        "openapi": "3.0.0",
        "paths": {
          "/jobs": {
            "get": {
              "responses": {
                "200": {
                  "content": {
                    "application/json": {
                      "schema": {
                        "additionalProperties": false,
                        "properties": {
                          "id": {
                            "nullable": true,
                            "type": "string",
                          },
                        },
                        "required": [
                          "id",
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
});
