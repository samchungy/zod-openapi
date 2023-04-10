import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createDiscriminatedUnionSchema } from './discriminatedUnion';

extendZodWithOpenApi(z);

describe('createDiscriminatedUnionSchema', () => {
  it('creates a oneOf schema', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['a'],
            },
          },
          required: ['type'],
        },
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['b'],
            },
          },
          required: ['type'],
        },
      ],
    };
    const result = createDiscriminatedUnionSchema(
      z.discriminatedUnion('type', [
        z.object({
          type: z.literal('a'),
        }),
        z.object({
          type: z.literal('b'),
        }),
      ]),
    );

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas are registered', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        { $ref: '#/components/schemas/a' },
        { $ref: '#/components/schemas/b' },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          a: '#/components/schemas/a',
          b: '#/components/schemas/b',
        },
      },
    };
    const result = createDiscriminatedUnionSchema(
      z.discriminatedUnion('type', [
        z
          .object({
            type: z.literal('a'),
          })
          .openapi({ schemaRef: 'a' }),
        z
          .object({
            type: z.literal('b'),
          })
          .openapi({ schemaRef: 'b' }),
      ]),
    );

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with enums are registered', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        { $ref: '#/components/schemas/c' },
        { $ref: '#/components/schemas/d' },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          c: '#/components/schemas/c',
          d: '#/components/schemas/d',
          e: '#/components/schemas/d',
        },
      },
    };
    const result = createDiscriminatedUnionSchema(
      z.discriminatedUnion('type', [
        z
          .object({
            type: z.literal('c'),
          })
          .openapi({ schemaRef: 'c' }),
        z
          .object({
            type: z.enum(['d', 'e']),
          })
          .openapi({ schemaRef: 'd' }),
      ]),
    );

    expect(result).toEqual(expected);
  });
});
