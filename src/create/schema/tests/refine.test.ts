import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('refine', () => {
  it('returns a schema when creating an output schema with preprocess', () => {
    const schema = z.string().refine((check) => typeof check === 'string');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });
});
