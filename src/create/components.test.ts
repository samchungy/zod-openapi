import { z } from 'zod';

import {
  ComponentsObject,
  createComponents,
  getDefaultComponents,
} from './components';

describe('getDefaultComponents', () => {
  it('returns default components', () => {
    const result = getDefaultComponents();
    const expected: ComponentsObject = {
      parameters: {},
      schemas: {},
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
      },
    );

    expect(componentsObject).toBeUndefined();
  });
});
