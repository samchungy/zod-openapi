import { z } from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('record', () => {
  it('creates an object schema with propertyNames', () => {
    const schema = z.record(z.string().regex(/^foo/), z.string());

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        propertyNames: {
          type: 'string',
          pattern: '^foo',
        },
        additionalProperties: {
          type: 'string',
        },
      },
      components: {},
    });
  });

  it('supports registering key schemas', () => {
    const complexSchema = z.string().regex(/^foo/).meta({ id: 'key' });

    const schema = z.record(complexSchema, z.string());

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        propertyNames: {
          $ref: '#/components/schemas/key',
        },
        additionalProperties: {
          type: 'string',
        },
      },
      components: {
        key: {
          type: 'string',
          pattern: '^foo',
        },
      },
    });
  });

  it('supports lazy key schemas', () => {
    const complexSchema = z.string().regex(/^foo/).meta({ id: 'key2' });

    const schema = z.record(complexSchema, z.string());

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        propertyNames: {
          $ref: '#/components/schemas/key2',
        },
        additionalProperties: {
          type: 'string',
        },
      },
      components: {
        key2: {
          type: 'string',
          pattern: '^foo',
        },
      },
    });
  });
});
