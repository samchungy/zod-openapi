import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('bigint', () => {
  it('creates a int64 schema', () => {
    const schema = z.bigint();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'integer',
        format: 'int64',
      },
      components: {},
    });
  });
});
