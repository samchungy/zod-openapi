import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createEnumSchema } from './enum';

extendZodWithOpenApi(z);

describe('createEnumSchema', () => {
  it('creates a string enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['a', 'b'],
    };
    const result = createEnumSchema(z.enum(['a', 'b']));

    expect(result).toEqual(expected);
  });
});
