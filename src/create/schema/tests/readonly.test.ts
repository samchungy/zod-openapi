import { z } from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('readonly', () => {
  it('creates a simple string schema for a readonly string', () => {
    const schema = z.string().readonly();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        readOnly: true,
      },
      components: {},
    });
  });
});
