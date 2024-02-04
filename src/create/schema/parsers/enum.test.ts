import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';

import { createEnumSchema } from './enum';

extendZodWithOpenApi(z);

describe('createEnumSchema', () => {
  it('creates a string enum schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        enum: ['a', 'b'],
      },
    };
    const schema = z.enum(['a', 'b']);

    const result = createEnumSchema(schema);

    expect(result).toEqual(expected);
  });
});
