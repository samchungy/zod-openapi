import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('brand', () => {
  it('supports branded schema', () => {
    const schema = z.object({ name: z.string() }).brand<'Cat'>();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
        additionalProperties: false,
        required: ['name'],
      },
      components: {},
    });
  });
});
