import { z } from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema';

describe('intersection', () => {
  it('creates an intersection schema', () => {
    const schema = z.intersection(z.string(), z.number());

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        allOf: [
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

  it('creates an object with an allOf', () => {
    const schema = z.object({
      a: z.string(),
    });

    const andSchema = schema.and(
      z.object({
        b: z.string(),
      }),
    );

    const result = createSchema(andSchema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              a: {
                type: 'string',
              },
            },
            required: ['a'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              b: {
                type: 'string',
              },
            },
            required: ['b'],
            additionalProperties: false,
          },
        ],
      },
      components: {},
    });
  });

  it('attempts to flatten nested and usage', () => {
    const schema = z.object({
      a: z.string(),
    });

    const schema2 = z.object({
      b: z.string(),
    });

    const schema3 = z.object({
      c: z.string(),
    });

    const result = createSchema(schema.and(schema2).and(schema3));

    expect(result).toEqual<SchemaResult>({
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              a: {
                type: 'string',
              },
            },
            required: ['a'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              b: {
                type: 'string',
              },
            },
            required: ['b'],
            additionalProperties: false,
          },
          {
            type: 'object',
            properties: {
              c: {
                type: 'string',
              },
            },
            required: ['c'],
            additionalProperties: false,
          },
        ],
      },
      components: {},
    });
  });
});
