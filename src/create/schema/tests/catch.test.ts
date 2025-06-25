import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';

describe('catch', () => {
  it('creates a default string schema for a string with a catch', () => {
    const schema = z.string().catch('bob');

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'string',
        default: 'bob',
      },
      components: {},
    });
  });
});
