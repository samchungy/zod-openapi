import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createOutputState } from '../../../testing/state';

import { createCatchSchema } from './catch';

extendZodWithOpenApi(z);

describe('createCatchSchema', () => {
  it('creates a simple string schema for a string with a catch', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.string().catch('bob');

    const result = createCatchSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
