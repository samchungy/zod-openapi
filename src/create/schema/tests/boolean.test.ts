import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';

describe('boolean', () => {
  it('creates a boolean schema', () => {
    const schema = z.boolean();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'boolean',
      },
      components: {},
    });
  });
});
