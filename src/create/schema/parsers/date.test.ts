import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';

import { createDateSchema } from './date';

extendZodWithOpenApi(z);

describe('createDateSchema', () => {
  it('creates a string schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.date();

    const result = createDateSchema(schema);

    expect(result).toEqual(expected);
  });
});
