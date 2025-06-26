import { z } from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('null', () => {
  it('creates a null schema', () => {
    const schema = z.null();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'null',
      },
      components: {},
    });
  });
});
