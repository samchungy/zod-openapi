import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('brand', () => {
  it('supports branded schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      additionalProperties: false,
      required: ['name'],
    };

    const schema = z.object({ name: z.string() }).brand<'Cat'>();

    const result = createSchema(schema, createOutputState(), ['brand']);

    expect(result).toEqual(expected);
  });
});
