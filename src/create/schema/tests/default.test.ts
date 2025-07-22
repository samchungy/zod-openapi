import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('default', () => {
  it('creates a default string schema', () => {
    const schema = z.string().default('a');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        default: 'a',
      },
      components: {},
    });
  });

  it('adds a default property to a registered schema', () => {
    const schema = z.string().meta({ id: 'ref' }).default('a');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        $ref: '#/components/schemas/ref',
        default: 'a',
      },
      components: {
        ref: {
          type: 'string',
        },
      },
    });
  });
});
