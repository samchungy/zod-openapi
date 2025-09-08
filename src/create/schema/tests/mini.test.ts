import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';

import { type SchemaResult, createSchema } from '../schema.js';

describe('mini default', () => {
  it('creates a default string schema', () => {
    const schema = z._default(z.string(), 'a').register(z.globalRegistry, {});

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
    const schema = z._default(
      z.string().register(z.globalRegistry, { id: 'ref' }),
      'a',
    );

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
