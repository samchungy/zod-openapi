import '../../../extend';
import { z } from 'zod';

import type { Schema } from '..';

import { createBooleanSchema } from './boolean';

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
