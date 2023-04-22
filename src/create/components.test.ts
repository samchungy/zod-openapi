import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import {
  CompleteSchemaComponent,
  ComponentsObject,
  HeaderComponent,
  HeaderComponentMap,
  ParameterComponent,
  ParameterComponentMap,
  SchemaComponent,
  SchemaComponentMap,
  createComponents,
  getDefaultComponents,
} from './components';

extendZodWithOpenApi(z);

describe('getDefaultComponents', () => {
  it('returns default components', () => {
    const result = getDefaultComponents();
    const expected: ComponentsObject = {
      parameters: expect.any(Map),
      schemas: expect.any(Map),
      headers: expect.any(Map),
      openapi: '3.1.0',
    };
    expect(result).toStrictEqual(expected);
  });

  it('returns components combined with manually declared components', () => {
    const aSchema = z.string();
    const bSchema = z.string();
    const cSchema = z.string();
    const result = getDefaultComponents({
      parameters: {
        a: {
          in: 'path',
          name: 'a',
          schema: {
            type: 'string',
          },
        },
      },
      requestParams: {
        header: z.object({
          b: bSchema,
        }),
      },
      schemas: {
        a: aSchema,
        b: {
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
      responseHeaders: z.object({
        c: cSchema,
      }),
    });
    const expected: ComponentsObject = {
      parameters: expect.any(Map),
      schemas: expect.any(Map),
      headers: expect.any(Map),
      openapi: '3.1.0',
    };
    const expectedParameter: ParameterComponent = {
      paramObject: {
        in: 'header',
        name: 'b',
        required: true,
        schema: { type: 'string' },
      },
      ref: 'b',
      type: 'complete',
    };
    const expectedSchema: SchemaComponent = {
      schemaObject: {
        type: 'string',
      },
      ref: 'a',
      type: 'complete',
    };
    const expectedHeader: HeaderComponent = {
      headerObject: {
        schema: {
          type: 'string',
        },
        required: true,
      },
      ref: 'c',
      type: 'complete',
    };

    expect(result).toStrictEqual(expected);
    expect(result.schemas.get(aSchema)).toStrictEqual(expectedSchema);
    expect(result.parameters.get(bSchema)).toStrictEqual(expectedParameter);
    expect(result.headers.get(cSchema)).toStrictEqual(expectedHeader);
  });

  it('allows registering schemas in any order', () => {
    const expected: ComponentsObject = {
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
    const expectedA: CompleteSchemaComponent = {
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
      type: 'complete',
    };
    const expectedB: CompleteSchemaComponent = {
      ref: 'b',
      schemaObject: {
        type: 'object',
        properties: {
          a: {
            $ref: '#/components/schemas/a',
          },
        },
        required: ['a'],
      },
      type: 'complete',
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
        parameters: new Map(),
        schemas: new Map(),
        headers: new Map(),
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
    };
    const schemaMap: SchemaComponentMap = new Map();
    schemaMap.set(z.string().openapi({ ref: 'a' }), {
      type: 'complete',
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
      creationType: 'output',
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
      {},
      {
        parameters: paramMap,
        schemas: schemaMap,
        headers: headerMap,
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
      creationType: 'output',
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
        parameters: paramMap,
        schemas: schemaMap,
        headers: headerMap,
        openapi: '3.1.0',
      },
    );

    expect(componentsObject).toStrictEqual(expected);
  });
});
