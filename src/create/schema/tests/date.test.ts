import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('date', () => {
  it('creates a string schema', () => {
    const schema = z.date();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });

  it('sets a custom format', () => {
    const schema = z.date().meta({
      format: 'date-time',
    });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        format: 'date-time',
      },
      components: {},
    });
  });

  it('sets a custom type', () => {
    const schema = z.date().meta({
      override: {
        type: 'number',
      },
    });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'number',
      },
      components: {},
    });
  });
});
