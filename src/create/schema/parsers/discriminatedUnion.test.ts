import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createOutputState } from '../../../testing/state';
import type { ZodOpenApiComponentsObject } from '../../document';

import { createDiscriminatedUnionSchema } from './discriminatedUnion';

extendZodWithOpenApi(z);

describe('createDiscriminatedUnionSchema', () => {
  it('creates a oneOf schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        oneOf: [
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                const: 'a',
              },
            },
            required: ['type'],
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                const: 'b',
              },
            },
            required: ['type'],
          },
        ],
      },
    };
    const schema = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('a'),
      }),
      z.object({
        type: z.literal('b'),
      }),
    ]);

    const result = createDiscriminatedUnionSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas are registered', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        oneOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            $ref: '#/components/schemas/b',
          },
        ],
        discriminator: {
          propertyName: 'type',
          mapping: {
            a: '#/components/schemas/a',
            b: '#/components/schemas/b',
          },
        },
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a'),
        })
        .openapi({ ref: 'a' }),
      z
        .object({
          type: z.literal('b'),
        })
        .openapi({ ref: 'b' }),
    ]);

    const result = createDiscriminatedUnionSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with enums are registered', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        oneOf: [
          {
            $ref: '#/components/schemas/c',
          },
          {
            $ref: '#/components/schemas/d',
          },
        ],
        discriminator: {
          propertyName: 'type',
          mapping: {
            c: '#/components/schemas/c',
            d: '#/components/schemas/d',
            e: '#/components/schemas/d',
          },
        },
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('c'),
        })
        .openapi({ ref: 'c' }),
      z
        .object({
          type: z.enum(['d', 'e']),
        })
        .openapi({ ref: 'd' }),
    ]);

    const result = createDiscriminatedUnionSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with enums are registered manually', () => {
    const c = z.object({
      type: z.literal('c'),
    });

    const d = z.object({
      type: z.enum(['d', 'e']),
    });

    const components: ZodOpenApiComponentsObject = {
      schemas: {
        c,
        d,
      },
    };

    const expected: Schema = {
      type: 'schema',
      schema: {
        oneOf: [
          {
            $ref: '#/components/schemas/c',
          },
          {
            $ref: '#/components/schemas/d',
          },
        ],
        discriminator: {
          propertyName: 'type',
          mapping: {
            c: '#/components/schemas/c',
            d: '#/components/schemas/d',
            e: '#/components/schemas/d',
          },
        },
      },
    };
    const schema = z.discriminatedUnion('type', [c, d]);

    const result = createDiscriminatedUnionSchema(
      schema,
      createOutputState(components),
    );

    expect(result).toEqual(expected);
  });
});
