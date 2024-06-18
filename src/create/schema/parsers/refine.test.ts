import '../../../extend';
import { z } from 'zod';

import { createOutputState } from '../../../testing/state';
import type { Schema } from '../schema';

import { createRefineSchema } from './refine';

describe('createRefineSchema', () => {
  it('returns a schema when creating an output schema with preprocess', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.string().refine((check) => typeof check === 'string');

    const result = createRefineSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
