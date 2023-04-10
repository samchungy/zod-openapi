import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createNullableSchema } from './nullable';

extendZodWithOpenApi(z);

describe('createNullableSchema', () => {
  it('creates a simple nullable string schema', () => {
    const expected: oas31.SchemaObject = {
      type: ['string', 'null'],
    };
    const result = createNullableSchema(z.string().nullable());

    expect(result).toEqual(expected);
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
    const result = createNullableSchema(registered.optional().nullable());

    expect(result).toEqual(expected);
  });

  it('creates an oneOf nullable schema', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
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
    const result = createNullableSchema(
      z
        .union([z.object({ a: z.string() }), z.object({ b: z.string() })])
        .nullable(),
    );

    expect(result).toEqual(expected);
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

    const result = createNullableSchema(
      z
        .object({
          b: object2.nullable(),
        })
        .nullable(),
    );

    expect(result).toEqual(expected);
  });
});
