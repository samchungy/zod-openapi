import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import {
  ComponentsObject,
  SchemaComponentMap,
  createComponents,
  getDefaultComponents,
} from './components';

extendZodWithOpenApi(z);

describe('getDefaultComponents', () => {
  it('returns default components', () => {
    const result = getDefaultComponents();
    const expected: ComponentsObject = {
      parameters: {},
      schemas: expect.any(Map),
      headers: {},
      openapi: '3.1.0',
    };
    expect(result).toStrictEqual(expected);
  });

  it('returns components combined ith manually declared components', () => {
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
      parameters: {
        a: {
          paramObject: {
            in: 'path',
            name: 'a',
            schema: {
              type: 'string',
            },
          },
        },
      },
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
});

describe('createComponents', () => {
  it('creates components object as undefined', () => {
    const componentsObject = createComponents(
      {},
      {
        parameters: {},
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
    const map: SchemaComponentMap = new Map();
    map.set(z.string().openapi({ ref: 'a' }), {
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
      creationTypes: ['output'],
    });
    const componentsObject = createComponents(
      {},
      {
        parameters: {
          a: {
            paramObject: {
              in: 'header',
              name: 'some-header',
              schema: {
                type: 'string',
              },
            },
            zodSchema: z.string().openapi({ param: { ref: 'a' } }),
          },
        },
        schemas: map,
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
    const map: SchemaComponentMap = new Map();
    map.set(z.string().openapi({ ref: 'a' }), {
      ref: 'a',
      schemaObject: {
        type: 'string',
      },
      creationTypes: ['output'],
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
        parameters: {
          a: {
            paramObject: {
              in: 'header',
              name: 'some-header',
              schema: {
                type: 'string',
              },
            },
            zodSchema: z.string().openapi({ param: { ref: 'a' } }),
          },
        },
        schemas: map,
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
