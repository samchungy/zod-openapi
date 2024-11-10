import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createCatchSchema } from './catch';

describe('createCatchSchema', () => {
  it('creates a default string schema for a string with a catch', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        default: 'bob',
      },
    };
    const schema = z.string().catch('bob');

    const result = createCatchSchema(schema, createOutputState(), undefined);

    expect(result).toEqual(expected);
  });
});
