import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';

describe('readonly', () => {
  it('creates a simple string schema for a readonly string', () => {
    const schema = z.string().readonly();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'string',
        readOnly: true,
      },
      components: {},
    });
  });
});
