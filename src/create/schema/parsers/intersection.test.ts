import '../../../extend';
import { z } from 'zod';

import { createOutputState } from '../../../testing/state';
import type { Schema } from '../schema';

import { createIntersectionSchema } from './intersection';

describe('createIntersectionSchema', () => {
  it('creates an intersection schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        allOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
    };
    const schema = z.intersection(z.string(), z.number());

    const result = createIntersectionSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
