import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';
import { createOutputContext } from '../../../testing/ctx';

describe('nullable', () => {
  it('creates a simple nullable string schema', () => {
    const schema = z.string().nullable();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'null',
          },
        ],
      },
      components: {},
    });
  });

  it('creates an oneOf nullable schema for registered schemas', () => {
    const registered = z.string().meta({ id: 'a' });
    const schema = registered.optional().nullable();

    const ctx = createOutputContext();

    const result = createSchema(schema, ctx);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        anyOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            type: 'null',
          },
        ],
      },
      components: {
        a: {
          type: 'string',
        },
      },
    });
  });

  it('creates an anyOf nullable schema', () => {
    const schema = z
      .union([z.object({ a: z.string() }), z.object({ b: z.string() })])
      .nullable();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        anyOf: [
          {
            anyOf: [
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
          {
            type: 'null',
          },
        ],
      },
      components: {},
    });
  });

  it('creates a nullable allOf nullable schema', () => {
    const object1 = z.object({ a: z.string() }).meta({ id: 'nullable' });
    const object2 = object1.extend({ b: z.string() });
    const schema = z.object({ b: object2.nullable() }).nullable();

    const ctx = createOutputContext();

    const result = createSchema(schema, ctx);

    expect(result).toEqual<CreateSchemaResult>({
      components: {},
      schema: {
        anyOf: [
          {
            additionalProperties: false,
            properties: {
              b: {
                anyOf: [
                  {
                    additionalProperties: false,
                    properties: {
                      a: { type: 'string' },
                      b: { type: 'string' },
                    },
                    required: ['a', 'b'],
                    type: 'object',
                  },
                  { type: 'null' },
                ],
              },
            },
            required: ['b'],
            type: 'object',
          },
          { type: 'null' },
        ],
      },
    });
  });

  it('creates a nullable enum', () => {
    const schema = z.enum(['a', 'b']).nullable();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        anyOf: [
          {
            type: 'string',
            enum: ['a', 'b'],
          },
          {
            type: 'null',
          },
        ],
      },
      components: {},
    });
  });

  it('creates a nullable enum from a literal', () => {
    const schema = z.literal('a').nullable();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        anyOf: [
          {
            type: 'string',
            const: 'a',
          },
          {
            type: 'null',
          },
        ],
      },
      components: {},
    });
  });
});
