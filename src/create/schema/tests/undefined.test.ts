import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('undefined', () => {
  it('should create an empty schema for undefined', () => {
    const schema = z.undefined();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        not: {},
      },
      components: {},
    });
  });
});
