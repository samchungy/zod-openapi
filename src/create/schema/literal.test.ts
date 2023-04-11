import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createLiteralSchema } from './literal';

extendZodWithOpenApi(z);

describe('createLiteralSchema', () => {
  it('creates a string enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['a'],
    };
    const schema = z.literal('a');

    const result = createLiteralSchema(schema);

    expect(result).toEqual(expected);
  });

  it('creates a number enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      enum: [2],
    };
    const schema = z.literal(2);

    const result = createLiteralSchema(schema);

    expect(result).toEqual(expected);
  });

  it('creates a boolean enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'boolean',
      enum: [true],
    };
    const schema = z.literal(true);

    const result = createLiteralSchema(schema);

    expect(result).toEqual(expected);
  });
});
