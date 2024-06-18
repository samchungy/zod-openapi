import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createCatchSchema } from './catch';

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
