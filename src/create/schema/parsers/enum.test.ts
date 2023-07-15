import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createEnumSchema } from './enum';

extendZodWithOpenApi(z);

describe('createEnumSchema', () => {
  it('creates a string enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['a', 'b'],
    };
    const schema = z.enum(['a', 'b']);

    const result = createEnumSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
