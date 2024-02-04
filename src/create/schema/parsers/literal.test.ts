import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';

import { createLiteralSchema } from './literal';

extendZodWithOpenApi(z);

describe('createLiteralSchema', () => {
  it('creates a string enum schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        enum: ['a'],
      },
    };
    const schema = z.literal('a');

    const result = createLiteralSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number enum schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'number',
        enum: [2],
      },
    };
    const schema = z.literal(2);

    const result = createLiteralSchema(schema);

    expect(result).toEqual(expected);
  });

  it('creates a boolean enum schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'boolean',
        enum: [true],
      },
    };
    const schema = z.literal(true);

    const result = createLiteralSchema(schema);

    expect(result).toEqual(expected);
  });
});
