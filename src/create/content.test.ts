import '../entries/extend';
import { z } from 'zod';

import type { oas31 } from '../openapi3-ts/dist';

import { getDefaultComponents } from './components';
import { createContent } from './content';

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
      'output',
      ['/job', 'post'],
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
      'output',
      ['/job', 'post'],
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
      'output',
      ['/job', 'post'],
    );

    expect(result).toStrictEqual(expectedResult);
  });
});
