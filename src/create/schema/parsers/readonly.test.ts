import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createReadonlySchema } from './readonly';

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
