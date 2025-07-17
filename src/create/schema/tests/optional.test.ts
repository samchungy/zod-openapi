import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('optional', () => {
  it('creates a simple string schema for an optional string', () => {
    const schema = z.string().optional();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });
});
