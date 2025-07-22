import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('boolean', () => {
  it('creates a boolean schema', () => {
    const schema = z.boolean();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'boolean',
      },
      components: {},
    });
  });
});
