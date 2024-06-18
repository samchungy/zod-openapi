import '../../../extend';
import { z } from 'zod';

import { createOutputState } from '../../../testing/state';

import { createReadonlySchema } from './readonly';

import type { Schema } from '.index';

describe('createReadonlySchema', () => {
  it('creates a simple string schema for a readonly string', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.string().readonly();

    const result = createReadonlySchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
