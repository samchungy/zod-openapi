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
            responseHeaders: z.object({
              'my-header': z.string().openapi({ header: { ref: 'my-header' } }),
            }),
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
            responseHeaders: z.object({
              'my-header': z.string().openapi({ header: { ref: 'my-header' } }),
            }),
          },
        },
      },
    },
  },
  components: {
    schemas: {
      manual,
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
    const document = createDocumentJson(registeredZodOpenApiObject);

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
                  "headers": {
                    "my-header": {
                      "$ref": "#/components/headers/my-header"
                    }
                  },
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
          },
          "headers": {
            "my-header": {
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

  it('should generate a complex JSON document string with components', () => {
    const document = createDocumentJson(complexZodOpenApiObject);

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
                        },
                        "b": {
                          "$ref": "#/components/schemas/b"
                        },
                        "c": {
                          "$ref": "#/components/schemas/b"
                        },
                        "d": {
                          "$ref": "#/components/schemas/c"
                        },
                        "e": {
                          "oneOf": [
                            {
                              "$ref": "#/components/schemas/union-a"
                            },
                            {
                              "$ref": "#/components/schemas/union-b"
                            }
                          ],
                          "discriminator": {
                            "propertyName": "type",
                            "mapping": {
                              "a": "#/components/schemas/union-a",
                              "b": "#/components/schemas/union-b"
                            }
                          }
                        },
                        "f": {
                          "type": "array",
                          "maxItems": 3,
                          "minItems": 3,
                          "prefixItems": [
                            {
                              "type": "string"
                            },
                            {
                              "type": "number"
                            },
                            {
                              "$ref": "#/components/schemas/manual"
                            }
                          ]
                        }
                      },
                      "required": [
                        "a",
                        "b",
                        "d",
                        "e",
                        "f"
                      ]
                    }
                  }
                }
              },
              "responses": {
                "200": {
                  "description": "200 OK",
                  "headers": {
                    "my-header": {
                      "$ref": "#/components/headers/my-header"
                    }
                  },
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "a": {
                            "$ref": "#/components/schemas/a"
                          },
                          "b": {
                            "$ref": "#/components/schemas/b"
                          },
                          "c": {
                            "$ref": "#/components/schemas/b"
                          },
                          "d": {
                            "$ref": "#/components/schemas/c"
                          },
                          "e": {
                            "oneOf": [
                              {
                                "$ref": "#/components/schemas/union-a"
                              },
                              {
                                "$ref": "#/components/schemas/union-b"
                              }
                            ],
                            "discriminator": {
                              "propertyName": "type",
                              "mapping": {
                                "a": "#/components/schemas/union-a",
                                "b": "#/components/schemas/union-b"
                              }
                            }
                          },
                          "f": {
                            "type": "array",
                            "maxItems": 3,
                            "minItems": 3,
                            "prefixItems": [
                              {
                                "type": "string"
                              },
                              {
                                "type": "number"
                              },
                              {
                                "$ref": "#/components/schemas/manual"
                              }
                            ]
                          }
                        },
                        "required": [
                          "a",
                          "b",
                          "d",
                          "e",
                          "f"
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
            "manual": {
              "type": "boolean"
            },
            "a": {
              "type": "string"
            },
            "b": {
              "type": "object",
              "properties": {
                "a": {
                  "type": "string"
                }
              },
              "required": [
                "a"
              ]
            },
            "c": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/b"
                },
                {
                  "type": "object",
                  "properties": {
                    "d": {
                      "type": [
                        "string",
                        "null"
                      ]
                    }
                  },
                  "required": [
                    "d"
                  ]
                }
              ]
            },
            "union-a": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": [
                    "a"
                  ]
                }
              },
              "required": [
                "type"
              ]
            },
            "union-b": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": [
                    "b"
                  ]
                }
              },
              "required": [
                "type"
              ]
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
          },
          "headers": {
            "my-header": {
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

  it('should generate a complex JSON document string with components in 3.0.0', () => {
    const document = createDocumentJson({
      ...complexZodOpenApiObject,
      openapi: '3.0.0',
    });

    expect(document).toMatchInlineSnapshot(`
      "{
        "info": {
          "title": "My API",
          "version": "1.0.0"
        },
        "openapi": "3.0.0",
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
                        },
                        "b": {
                          "$ref": "#/components/schemas/b"
                        },
                        "c": {
                          "$ref": "#/components/schemas/b"
                        },
                        "d": {
                          "$ref": "#/components/schemas/c"
                        },
                        "e": {
                          "oneOf": [
                            {
                              "$ref": "#/components/schemas/union-a"
                            },
                            {
                              "$ref": "#/components/schemas/union-b"
                            }
                          ],
                          "discriminator": {
                            "propertyName": "type",
                            "mapping": {
                              "a": "#/components/schemas/union-a",
                              "b": "#/components/schemas/union-b"
                            }
                          }
                        },
                        "f": {
                          "type": "array",
                          "maxItems": 3,
                          "minItems": 3,
                          "items": {
                            "oneOf": [
                              {
                                "type": "string"
                              },
                              {
                                "type": "number"
                              },
                              {
                                "$ref": "#/components/schemas/manual"
                              }
                            ]
                          }
                        }
                      },
                      "required": [
                        "a",
                        "b",
                        "d",
                        "e",
                        "f"
                      ]
                    }
                  }
                }
              },
              "responses": {
                "200": {
                  "description": "200 OK",
                  "headers": {
                    "my-header": {
                      "$ref": "#/components/headers/my-header"
                    }
                  },
                  "content": {
                    "application/json": {
                      "schema": {
                        "type": "object",
                        "properties": {
                          "a": {
                            "$ref": "#/components/schemas/a"
                          },
                          "b": {
                            "$ref": "#/components/schemas/b"
                          },
                          "c": {
                            "$ref": "#/components/schemas/b"
                          },
                          "d": {
                            "$ref": "#/components/schemas/c"
                          },
                          "e": {
                            "oneOf": [
                              {
                                "$ref": "#/components/schemas/union-a"
                              },
                              {
                                "$ref": "#/components/schemas/union-b"
                              }
                            ],
                            "discriminator": {
                              "propertyName": "type",
                              "mapping": {
                                "a": "#/components/schemas/union-a",
                                "b": "#/components/schemas/union-b"
                              }
                            }
                          },
                          "f": {
                            "type": "array",
                            "maxItems": 3,
                            "minItems": 3,
                            "items": {
                              "oneOf": [
                                {
                                  "type": "string"
                                },
                                {
                                  "type": "number"
                                },
                                {
                                  "$ref": "#/components/schemas/manual"
                                }
                              ]
                            }
                          }
                        },
                        "required": [
                          "a",
                          "b",
                          "d",
                          "e",
                          "f"
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
            "manual": {
              "type": "boolean"
            },
            "a": {
              "type": "string"
            },
            "b": {
              "type": "object",
              "properties": {
                "a": {
                  "type": "string"
                }
              },
              "required": [
                "a"
              ]
            },
            "c": {
              "allOf": [
                {
                  "$ref": "#/components/schemas/b"
                },
                {
                  "type": "object",
                  "properties": {
                    "d": {
                      "type": "string",
                      "nullable": true
                    }
                  },
                  "required": [
                    "d"
                  ]
                }
              ]
            },
            "union-a": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": [
                    "a"
                  ]
                }
              },
              "required": [
                "type"
              ]
            },
            "union-b": {
              "type": "object",
              "properties": {
                "type": {
                  "type": "string",
                  "enum": [
                    "b"
                  ]
                }
              },
              "required": [
                "type"
              ]
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
          },
          "headers": {
            "my-header": {
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
    const document = createDocumentYaml(registeredZodOpenApiObject);

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
                headers:
                  my-header:
                    $ref: "#/components/headers/my-header"
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
        headers:
          my-header:
            schema:
              type: string
            required: true
      "
    `);
  });
});
