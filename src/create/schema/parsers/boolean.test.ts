import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createBooleanSchema } from './boolean';

extendZodWithOpenApi(z);

describe('createBooleanSchema', () => {
  it('creates a boolean schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'boolean',
    };
    const schema = z.boolean();

    const result = createBooleanSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
