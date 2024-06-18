import '../../../extend';
import { z } from 'zod';

import { createOutputState } from '../../../testing/state';
import type { Schema } from '../schema';

import { createPreprocessSchema } from './preprocess';

describe('createPreprocessSchema', () => {
  it('returns a schema with preprocess', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.preprocess(
      (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
      z.string(),
    );

    const result = createPreprocessSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
