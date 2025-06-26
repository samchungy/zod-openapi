import { z } from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('boolean', () => {
  it('creates a boolean schema', () => {
    const schema = z.boolean();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'boolean',
      },
      components: {},
    });
  });
});
