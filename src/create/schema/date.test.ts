import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createDateSchema } from './date';

extendZodWithOpenApi(z);

describe('createDateSchema', () => {
  it('creates a string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.date();

    const result = createDateSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
