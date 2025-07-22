import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('literal', () => {
  it('creates a string const schema', () => {
    const schema = z.literal('a');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        const: 'a',
      },
      components: {},
    });
  });

  it('creates a number const schema', () => {
    const schema = z.literal(2);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'number',
        const: 2,
      },
      components: {},
    });
  });

  it('creates a boolean const schema', () => {
    const schema = z.literal(true);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'boolean',
        const: true,
      },
      components: {},
    });
  });

  it('creates a null const schema', () => {
    const schema = z.literal(null);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        const: null,
        type: 'null',
      },
      components: {},
    });
  });

  it('does not support undefined as a literal', () => {
    const schema = z.literal(undefined);

    expect(() => createSchema(schema)).toThrow(
      'Zod literal at properties > zodOpenApiCreateSchema cannot include `undefined` as a value. Please use `z.undefined()` or `.optional()` instead.',
    );
  });
});
