import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createTupleSchema } from './tuple';

extendZodWithOpenApi(z);

describe('createTupleSchema', () => {
  it('creates an array schema', () => {
    // FIXME: https://github.com/metadevpro/openapi3-ts/pull/109/files
    // const expected: oas31.SchemaObject = {
    const expected = {
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
    const result = createTupleSchema(z.tuple([z.string(), z.number()]));

    expect(result).toEqual(expected);
  });

  it('creates an array schema with additionalProperties', () => {
    // FIXME: https://github.com/metadevpro/openapi3-ts/pull/109/files
    // const expected: oas31.SchemaObject = {
    const expected = {
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
    const result = createTupleSchema(
      z.tuple([z.string(), z.number()]).rest(z.boolean()),
    );

    expect(result).toEqual(expected);
  });

  it('creates an empty array schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      minItems: 0,
      maxItems: 0,
    };
    const result = createTupleSchema(z.tuple([]));

    expect(result).toEqual(expected);
  });
});
