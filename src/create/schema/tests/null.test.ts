import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

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
