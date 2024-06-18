import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

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
