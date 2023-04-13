import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

import { createNullableSchema } from './nullable';

extendZodWithOpenApi(z);

describe('createNullableSchema', () => {
  it('creates a simple nullable string schema', () => {
    const expected: oas31.SchemaObject = {
      type: ['string', 'null'],
    };
    const schema = z.string().nullable();

    const result = createNullableSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });

  it('creates an oneOf nullable schema for registered schemas', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          $ref: '#/components/schemas/a',
        },
        {
          type: 'null',
        },
      ],
    };
    const registered = z.string().openapi({ ref: 'a' });
    const schema = registered.optional().nullable();

    const result = createNullableSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });

  it('creates an anyOf nullable schema', () => {
    const expected: oas31.SchemaObject = {
      anyOf: [
        {
          type: 'object',
          properties: {
            a: {
              type: 'string',
            },
          },
          required: ['a'],
        },
        {
          type: 'object',
          properties: {
            b: {
              type: 'string',
            },
          },
          required: ['b'],
        },
        {
          type: 'null',
        },
      ],
    };
    const schema = z
      .union([z.object({ a: z.string() }), z.object({ b: z.string() })])
      .nullable();

    const result = createNullableSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });

  it('creates a nullable allOf nullable schema', () => {
    const expected: oas31.SchemaObject = {
      type: ['object', 'null'],
      properties: {
        b: {
          oneOf: [
            {
              allOf: [
                { $ref: '#/components/schemas/a' },
                {
                  type: 'object',
                  properties: { b: { type: 'string' } },
                  required: ['b'],
                },
              ],
            },
            { type: 'null' },
          ],
        },
      },
      required: ['b'],
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const object2 = object1.extend({ b: z.string() });
    const schema = z.object({ b: object2.nullable() }).nullable();

    const result = createNullableSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });
});
