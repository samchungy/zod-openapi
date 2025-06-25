import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';
import { createOutputContext } from '../../../testing/ctx';
import type { SchemaResult } from '../single';

describe('array', () => {
  it('creates simple arrays', () => {
    const schema = z.array(z.string());

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      components: {},
    });
  });

  it('creates min and max', () => {
    const schema = z.array(z.string()).min(0).max(10);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 0,
        maxItems: 10,
      },
      components: {},
    });
  });

  it('creates exact length', () => {
    const schema = z.array(z.string()).length(10);

    const result = createSchema(schema, createOutputContext());

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 10,
        maxItems: 10,
      },
      components: {},
    });
  });
});
