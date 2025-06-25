import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';

describe('bigint', () => {
  it('creates a int64 schema', () => {
    const schema = z.bigint();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'integer',
        format: 'int64',
      },
      components: {},
    });
  });
});
