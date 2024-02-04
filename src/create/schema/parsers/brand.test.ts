import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createBrandedSchema } from './brand';

describe('createBrandedSchema', () => {
  it('supports branded schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        required: ['name'],
      },
    };
    const result = createBrandedSchema(
      z.object({ name: z.string() }).brand<'Cat'>(),
      createOutputState(),
    );
    expect(result).toEqual(expected);
  });
});
