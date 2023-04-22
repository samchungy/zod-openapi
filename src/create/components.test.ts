import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import {
  CompleteSchemaComponent,
  ComponentsObject,
  ParameterComponentMap,
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
      headers: {},
      openapi: '3.1.0',
    };
    expect(result).toStrictEqual(expected);
  });

  it('returns components combined with manually declared components', () => {
    const aSchema = z.string();
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
    });
    const expected: ComponentsObject = {
      parameters: expect.any(Map),
      schemas: expect.any(Map),
      headers: {
        a: {
          headerObject: {
            schema: {
              type: 'string',
            },
          },
        },
      },
      openapi: '3.1.0',
    };
    expect(result).toStrictEqual(expected);
    expect(result.schemas.get(aSchema)?.ref).toBe('a');
  });

  it('allows registering schemas in any order', () => {
    const expected: ComponentsObject = {
      headers: {},
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
      creationType: undefined,
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
      type: 'complete',
    };
    const expectedB: CompleteSchemaComponent = {
      creationType: undefined,
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
        headers: {},
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
    const componentsObject = createComponents(
      {},
      {
        parameters: paramMap,
        schemas: schemaMap,
        headers: {
          a: {
            headerObject: {
              schema: {
                type: 'string',
              },
            },
            zodSchema: z.string().openapi({ ref: 'a' }),
          },
        },
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
        headers: {
          a: {
            headerObject: {
              schema: {
                type: 'string',
              },
            },
          },
        },
        openapi: '3.1.0',
      },
    );

    expect(componentsObject).toStrictEqual(expected);
  });
});
