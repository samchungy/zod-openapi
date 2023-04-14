import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import { getDefaultComponents } from './components';
import { createContent } from './content';

extendZodWithOpenApi(z);

describe('createContent', () => {
  it('should create schema from Zod Objects', () => {
    const expectedResult: oas31.ContentObject = {
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
    };

    const result = createContent(
      {
        'application/json': {
          schema: z.object({ a: z.string() }),
        },
      },
      getDefaultComponents(),
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('should preserve non Zod Objects', () => {
    const expectedResult: oas31.ContentObject = {
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
    };

    const result = createContent(
      {
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
      getDefaultComponents(),
    );

    expect(result).toStrictEqual(expectedResult);
  });

  it('should preserve additional properties', () => {
    const expectedResult: oas31.ContentObject = {
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
        example: {
          a: '123',
        },
      },
    };

    const result = createContent(
      {
        'application/json': {
          schema: z.object({ a: z.string() }),
          example: {
            a: '123',
          },
        },
      },
      getDefaultComponents(),
    );

    expect(result).toStrictEqual(expectedResult);
  });
});
