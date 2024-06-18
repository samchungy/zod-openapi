import '../entries/extend';
import { z } from 'zod';

import type { oas31 } from '../openapi3-ts/dist';

import {
  type CallbackComponent,
  type CallbackComponentMap,
  type ComponentsObject,
  type HeaderComponent,
  type HeaderComponentMap,
  type ManualSchemaComponent,
  type ParameterComponent,
  type ParameterComponentMap,
  type RequestBodyComponent,
  type RequestBodyComponentMap,
  type ResponseComponent,
  type ResponseComponentMap,
  type SchemaComponent,
  type SchemaComponentMap,
  createComponents,
  getDefaultComponents,
} from './components';
import type {
  ZodOpenApiCallbackObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
} from './document';

describe('getDefaultComponents', () => {
  it('returns default components', () => {
    const result = getDefaultComponents();
    const expected: ComponentsObject = {
      callbacks: expect.any(Map),
      responses: expect.any(Map),
      parameters: expect.any(Map),
      schemas: expect.any(Map),
      headers: expect.any(Map),
      requestBodies: expect.any(Map),
      openapi: '3.1.0',
    };
    expect(result).toStrictEqual(expected);
  });

  it('returns manual components', () => {
    const aSchema = z.string();
    const bSchema = z.string().openapi({ param: { in: 'header', name: 'b' } });
    const cSchema = z.string();
    const dResponse: ZodOpenApiResponseObject = {
      description: '200 OK',
      content: {
        'application/json': {
          schema: z.object({ a: z.string() }),
        },
      },
    };
    const eRequestBody: ZodOpenApiRequestBodyObject = {
      content: {
        'application/json': {
          schema: z.object({ a: z.string() }),
        },
      },
    };
    const fCallbacks: ZodOpenApiCallbackObject = {
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
    const result = getDefaultComponents({
      parameters: {
        a: {
          in: 'path',
          name: 'a',
          schema: {
            type: 'string',
          },
        },
        b: bSchema,
      },
      schemas: {
        a: aSchema,
        b: {
          type: 'string',
        },
      },
      headers: {
        c: cSchema,
      },
      responses: {
        d: dResponse,
      },
      requestBodies: {
        e: eRequestBody,
      },
      callbacks: {
        f: fCallbacks,
      },
    });
    const expected: ComponentsObject = {
      callbacks: expect.any(Map),
      requestBodies: expect.any(Map),
      responses: expect.any(Map),
      parameters: expect.any(Map),
      schemas: expect.any(Map),
      headers: expect.any(Map),
      openapi: '3.1.0',
    };
    const expectedParameter: ParameterComponent = {
      ref: 'b',
      type: 'manual',
      in: 'header',
      name: 'b',
    };
    const expectedSchema: SchemaComponent = {
      ref: 'a',
      type: 'manual',
    };
    const expectedHeader: HeaderComponent = {
      ref: 'c',
      type: 'manual',
    };
    const expectedResponse: ResponseComponent = {
      ref: 'd',
      type: 'manual',
    };
    const expectedRequestBodies: RequestBodyComponent = {
      ref: 'e',
      type: 'manual',
    };
    const expectedCallbacks: CallbackComponent = {
      ref: 'f',
      type: 'manual',
    };

    expect(result).toStrictEqual(expected);
    expect(result.schemas.get(aSchema)).toStrictEqual(expectedSchema);
    expect(result.parameters.get(bSchema)).toStrictEqual(expectedParameter);
    expect(result.headers.get(cSchema)).toStrictEqual(expectedHeader);
    expect(result.responses.get(dResponse)).toStrictEqual(expectedResponse);
    expect(result.requestBodies.get(eRequestBody)).toStrictEqual(
      expectedRequestBodies,
    );
    expect(result.callbacks.get(fCallbacks)).toStrictEqual(expectedCallbacks);
  });

  it('allows registering schemas in any order', () => {
    const expected: ComponentsObject = {
      callbacks: expect.any(Map),
      requestBodies: expect.any(Map),
      responses: expect.any(Map),
      headers: expect.any(Map),
      parameters: expect.any(Map),
      schemas: expect.any(Map),
      openapi: '3.1.0',
    };

    const a = z.string();
    const b = z.object({ a }).openapi({ ref: 'b' });
    const componentsObject = getDefaultComponents({
      schemas: {
        b,
        a,
      },
    });
    const expectedA: ManualSchemaComponent = {
      ref: 'a',
      type: 'manual',
    };
    const expectedB: ManualSchemaComponent = {
      ref: 'b',
      type: 'manual',
    };

    expect(componentsObject).toStrictEqual(expected);
    expect(componentsObject.schemas.get(a)).toStrictEqual(expectedA);
    expect(componentsObject.schemas.get(b)).toStrictEqual(expectedB);
  });
});

describe('createComponents', () => {
  it('creates components object as undefined', () => {
    const componentsObject = createComponents(
      {},
      {
        callbacks: expect.any(Map),
        requestBodies: new Map(),
        parameters: new Map(),
        schemas: new Map(),
        headers: new Map(),
        responses: new Map(),
        openapi: '3.1.0',
      },
    );

    expect(componentsObject).toBeUndefined();
  });

  it('creates a components object', () => {
    const expected: oas31.ComponentsObject = {
      parameters: {
        a: {
          in: 'header',
          name: 'some-header',
          schema: {
            type: 'string',
          },
        },
      },
      schemas: {
        a: {
          type: 'string',
        },
      },
      headers: {
        a: {
          schema: {
            type: 'string',
          },
        },
      },
      responses: {
        a: {
          description: '200 OK',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  a: {
                    type: 'string',
                  },
                },
                required: ['a'],
              },
            },
          },
        },
      },
      requestBodies: {
        a: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  a: {
                    type: 'string',
                  },
                },
                required: ['a'],
              },
            },
          },
        },
      },
      callbacks: {
        a: {
          '{$request.query.callbackUrl}/data': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        a: {
                          type: 'string',
                        },
                      },
                      required: ['a'],
                    },
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
        },
      },
    };
    const schemaMap: SchemaComponentMap = new Map();
    schemaMap.set(z.string().openapi({ ref: 'a' }), {
      type: 'complete',
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
    });
    const paramMap: ParameterComponentMap = new Map();
    paramMap.set(z.string(), {
      type: 'complete',
      ref: 'a',
      paramObject: {
        in: 'header',
        name: 'some-header',
        schema: {
          type: 'string',
        },
      },
      in: 'header',
      name: 'some-header',
    });
    const headerMap: HeaderComponentMap = new Map();
    headerMap.set(z.string(), {
      type: 'complete',
      ref: 'a',
      headerObject: {
        schema: {
          type: 'string',
        },
      },
    });
    const responseMap: ResponseComponentMap = new Map();
    responseMap.set(
      {
        description: '200 OK',
        content: {
          'application/json': {
            schema: z.object({ a: z.string() }),
          },
        },
      },
      {
        responseObject: {
          description: '200 OK',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  a: {
                    type: 'string',
                  },
                },
                required: ['a'],
              },
            },
          },
        },
        ref: 'a',
        type: 'complete',
      },
    );
    const requestBodyMap: RequestBodyComponentMap = new Map();
    requestBodyMap.set(
      {
        content: {
          'application/json': {
            schema: z.object({ a: z.string() }),
          },
        },
      },
      {
        type: 'complete',
        ref: 'a',
        requestBodyObject: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  a: {
                    type: 'string',
                  },
                },
                required: ['a'],
              },
            },
          },
        },
      },
    );
    const callbackMap: CallbackComponentMap = new Map();
    callbackMap.set(
      {
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
      },
      {
        type: 'complete',
        ref: 'a',
        callbackObject: {
          '{$request.query.callbackUrl}/data': {
            post: {
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        a: {
                          type: 'string',
                        },
                      },
                      required: ['a'],
                    },
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
        },
      },
    );

    const componentsObject = createComponents(
      {},
      {
        callbacks: callbackMap,
        parameters: paramMap,
        schemas: schemaMap,
        headers: headerMap,
        responses: responseMap,
        requestBodies: requestBodyMap,
        openapi: '3.1.0',
      },
    );

    expect(componentsObject).toStrictEqual(expected);
  });

  it('merges with existing components', () => {
    const expected: oas31.ComponentsObject = {
      examples: {
        a: {
          description: 'hello',
        },
      },
      parameters: {
        a: {
          in: 'header',
          name: 'some-header',
          schema: {
            type: 'string',
          },
        },
      },
      schemas: {
        a: {
          type: 'string',
        },
      },
      headers: {
        a: {
          schema: {
            type: 'string',
          },
        },
      },
    };
    const schemaMap: SchemaComponentMap = new Map();
    schemaMap.set(z.string(), {
      type: 'complete',
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
    });
    const paramMap: ParameterComponentMap = new Map();
    paramMap.set(z.string(), {
      type: 'complete',
      paramObject: {
        in: 'header',
        name: 'some-header',
        schema: {
          type: 'string',
        },
      },
      ref: 'a',
      in: 'header',
      name: 'some-header',
    });
    const headerMap: HeaderComponentMap = new Map();
    headerMap.set(z.string(), {
      type: 'complete',
      ref: 'a',
      headerObject: {
        schema: {
          type: 'string',
        },
      },
    });
    const componentsObject = createComponents(
      {
        examples: {
          a: {
            description: 'hello',
          },
        },
      },
      {
        callbacks: expect.any(Map),
        parameters: paramMap,
        schemas: schemaMap,
        headers: headerMap,
        responses: new Map(),
        requestBodies: new Map(),
        openapi: '3.1.0',
      },
    );

    expect(componentsObject).toStrictEqual(expected);
  });

  it('completes manual components', () => {
    const expected: oas31.ComponentsObject = {
      examples: {
        a: {
          description: 'hello',
        },
      },
      parameters: {
        a: {
          in: 'header',
          name: 'some-header',
          required: true,
          schema: {
            type: 'string',
          },
        },
      },
      schemas: {
        a: {
          type: 'string',
        },
      },
      headers: {
        a: {
          schema: {
            type: 'string',
          },
          required: true,
        },
      },
    };
    const schemaMap: SchemaComponentMap = new Map();
    schemaMap.set(z.string(), {
      type: 'manual',
      ref: 'a',
    });
    const paramMap: ParameterComponentMap = new Map();
    paramMap.set(z.string(), {
      type: 'manual',
      in: 'header',
      ref: 'a',
      name: 'some-header',
    });
    const headerMap: HeaderComponentMap = new Map();
    headerMap.set(z.string(), {
      type: 'manual',
      ref: 'a',
    });
    const componentsObject = createComponents(
      {
        examples: {
          a: {
            description: 'hello',
          },
        },
      },
      {
        callbacks: new Map(),
        parameters: paramMap,
        schemas: schemaMap,
        headers: headerMap,
        responses: new Map(),
        requestBodies: new Map(),
        openapi: '3.1.0',
      },
    );

    expect(componentsObject).toStrictEqual(expected);
  });
});
