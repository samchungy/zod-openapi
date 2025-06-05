import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

describe('tuple', () => {
  it('creates an array schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      prefixItems: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z.tuple([z.string(), z.number()]);

    const result = createSchema(schema, createOutputState(), ['tuple']);

    expect(result).toEqual(expected);
  });

  it('creates an array schema with additionalProperties', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      prefixItems: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
      items: {
        type: 'boolean',
      },
    };
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());

    const result = createSchema(schema, createOutputState(), ['tuple']);

    expect(result).toEqual(expected);
  });

  it('creates an empty array schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      prefixItems: [],
    };
    const schema = z.tuple([]);

    const result = createSchema(schema, createOutputState(), ['tuple']);

    expect(result).toEqual(expected);
  });

  it('creates an array schema with additionalProperties in openapi 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
          {
            type: 'boolean',
          },
        ],
      },
    };
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());

    const result = createSchema(schema, createOutputOpenapi3State(), ['tuple']);

    expect(result).toEqual(expected);
  });
});
