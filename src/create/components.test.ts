import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import {
  ComponentsObject,
  createComponents,
  getDefaultComponents,
} from './components';

extendZodWithOpenApi(z);

describe('getDefaultComponents', () => {
  it('returns default components', () => {
    const result = getDefaultComponents();
    const expected: ComponentsObject = {
      parameters: {},
      schemas: {},
      headers: {},
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
      schemas: {
        a: {
          schemaObject: {
            type: 'string',
          },
          zodSchema: aSchema,
        },
        b: {
          schemaObject: {
            type: 'string',
          },
        },
      },
      headers: {
        a: {
          headerObject: {
            schema: {
              type: 'string',
            },
          },
        },
      },
    };
    expect(result).toStrictEqual(expected);
  });
});

describe('createComponents', () => {
  it('creates components object as undefined', () => {
    const componentsObject = createComponents(
      {},
      {
        parameters: {},
        schemas: {},
        headers: {},
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
        schemas: {
          a: {
            schemaObject: {
              type: 'string',
            },
            zodSchema: z.string().openapi({ ref: 'a' }),
          },
        },
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
        schemas: {
          a: {
            schemaObject: {
              type: 'string',
            },
            zodSchema: z.string().openapi({ ref: 'a' }),
          },
        },
        headers: {
          a: {
            headerObject: {
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    );

    expect(componentsObject).toStrictEqual(expected);
  });
});
