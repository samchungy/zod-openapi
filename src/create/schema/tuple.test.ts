import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../testing/state';

import { createTupleSchema } from './tuple';

extendZodWithOpenApi(z);

describe('createTupleSchema', () => {
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
      minItems: 2,
      maxItems: 2,
    };
    const schema = z.tuple([z.string(), z.number()]);

    const result = createTupleSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
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

    const result = createTupleSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates an empty array schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      minItems: 0,
      maxItems: 0,
    };
    const schema = z.tuple([]);

    const result = createTupleSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
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

    const result = createTupleSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });
});
