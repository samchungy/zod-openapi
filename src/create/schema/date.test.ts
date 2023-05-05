import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';

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
