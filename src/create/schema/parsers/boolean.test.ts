import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';

import { createBooleanSchema } from './boolean';

extendZodWithOpenApi(z);

describe('createBooleanSchema', () => {
  it('creates a boolean schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'boolean',
      },
    };
    const schema = z.boolean();

    const result = createBooleanSchema(schema);

    expect(result).toEqual(expected);
  });
});
