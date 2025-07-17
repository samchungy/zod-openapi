import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('catch', () => {
  it('creates a default string schema for a string with a catch', () => {
    const schema = z.string().catch('bob');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        default: 'bob',
      },
      components: {},
    });
  });
});
