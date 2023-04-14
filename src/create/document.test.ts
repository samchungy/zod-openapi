import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import {
  ZodOpenApiObject,
  createDocumentJson,
  createDocumentYaml,
} from './document';

extendZodWithOpenApi(z);

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
const componentZodOpenApiObject: ZodOpenApiObject = {
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
          },
        },
      },
    },
  },
};

describe('createDocumentJson', () => {
  it('should generate a JSON document string', () => {
    const document = createDocumentJson(simpleZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
      "{
        "info": {
          "title": "My API",
          "version": "1.0.0"
        },
        "openapi": "3.1.0",
        "paths": {
          "/jobs": {
            "get": {
              "parameters": [
                {
                  "in": "path",
                  "name": "b",
                  "schema": {
                    "type": "string"
                  },
                  "required": true
                }
              ],
              "requestBody": {
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "a": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "a"
                      ]
                    }
                  }
                }
              },
              "responses": {
                "200": {
                  "description": "200 OK",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "a": {
                            "type": "string"
                          }
                        },
                        "required": [
                          "a"
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }"
    `);
  });

  it('should generate a JSON document string with components', () => {
    const document = createDocumentJson(componentZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
      "{
        "info": {
          "title": "My API",
          "version": "1.0.0"
        },
        "openapi": "3.1.0",
        "paths": {
          "/jobs": {
            "get": {
              "parameters": [
                {
                  "$ref": "#/components/parameters/b"
                }
              ],
              "requestBody": {
                "content": {
                  "application/json": {
                    "schema": {
                      "type": "object",
                      "properties": {
                        "a": {
                          "$ref": "#/components/schemas/a"
                        }
                      },
                      "required": [
                        "a"
                      ]
                    }
                  }
                }
              },
              "responses": {
                "200": {
                  "description": "200 OK",
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "a": {
                            "$ref": "#/components/schemas/a"
                          }
                        },
                        "required": [
                          "a"
                        ]
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "components": {
          "schemas": {
            "a": {
              "type": "string"
            }
          },
          "parameters": {
            "b": {
              "in": "path",
              "name": "b",
              "schema": {
                "type": "string"
              },
              "required": true
            }
          }
        }
      }"
    `);
  });
});

describe('createDocumentYaml', () => {
  it('should generate a YAML document string', () => {
    const document = createDocumentYaml(simpleZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
      "info:
        title: My API
        version: 1.0.0
      openapi: 3.1.0
      paths:
        /jobs:
          get:
            parameters:
              - in: path
                name: b
                schema:
                  type: string
                required: true
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      a:
                        type: string
                    required:
                      - a
            responses:
              "200":
                description: 200 OK
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        a:
                          type: string
                      required:
                        - a
      "
    `);
  });

  it('should generate a JSON document string with components', () => {
    const document = createDocumentYaml(componentZodOpenApiObject);

    expect(document).toMatchInlineSnapshot(`
      "info:
        title: My API
        version: 1.0.0
      openapi: 3.1.0
      paths:
        /jobs:
          get:
            parameters:
              - $ref: "#/components/parameters/b"
            requestBody:
              content:
                application/json:
                  schema:
                    type: object
                    properties:
                      a:
                        $ref: "#/components/schemas/a"
                    required:
                      - a
            responses:
              "200":
                description: 200 OK
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        a:
                          $ref: "#/components/schemas/a"
                      required:
                        - a
      components:
        schemas:
          a:
            type: string
        parameters:
          b:
            in: path
            name: b
            schema:
              type: string
            required: true
      "
    `);
  });
});
