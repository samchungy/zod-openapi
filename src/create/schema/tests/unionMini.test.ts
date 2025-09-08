import { describe, expect, it } from 'vitest';
import * as z from 'zod/mini';

import { createOutputContext } from '../../../testing/ctx.js';
import { type SchemaResult, createSchema } from '../schema.js';

describe('mini union', () => {
  it('creates an anyOf schema for a union', () => {
    const schema = z.union([z.string(), z.number()]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
      components: {},
    });
  });

  it('creates an oneOf schema for a union', () => {
    const schema = z
      .union([z.string(), z.number()])
      .register(z.globalRegistry, {
        override: ({ jsonSchema }) => {
          jsonSchema.oneOf = jsonSchema.anyOf;
          delete jsonSchema.anyOf;
        },
      });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
      components: {},
    });
  });

  it('creates an oneOf schema for a union if a document option overrides it', () => {
    const schema = z.union([z.string(), z.number()]);

    const ctx = createOutputContext();
    ctx.opts = {
      override: ({ jsonSchema }) => {
        jsonSchema.oneOf = jsonSchema.anyOf;
        delete jsonSchema.anyOf;
      },
    };
    const result = createSchema(schema, ctx);

    expect(result).toEqual<SchemaResult>({
      schema: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
      components: {},
    });
  });

  it('produces not values in a union', () => {
    const schema = z.union([z.string(), z.never()]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        anyOf: [
          {
            type: 'string',
          },
          {
            not: {},
          },
        ],
      },
      components: {},
    });
  });
});
