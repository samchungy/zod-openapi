import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createOptionalSchema } from './optional';

describe('createOptionalSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.string().optional();

    const result = createOptionalSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
