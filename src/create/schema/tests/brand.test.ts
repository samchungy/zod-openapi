import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

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
