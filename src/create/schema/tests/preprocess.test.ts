import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('preprocess', () => {
  it('returns a schema with preprocess', () => {
    const schema = z.preprocess(
      (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
      z.string(),
    );

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });
});
