import '../../../extend';
import { z } from 'zod';

import { createOutputState } from '../../../testing/state';

import { createRefineSchema } from './refine';

import type { Schema } from '.index';

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
