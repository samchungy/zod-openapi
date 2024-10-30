import '../../../entries/extend';

import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';
import type { ZodOpenApiComponentsObject } from '../../document';

import { createDiscriminatedUnionSchema } from './discriminatedUnion';

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

  it('creates a oneOf schema with discriminator mapping when schemas with string nativeEnums', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        discriminator: {
          mapping: {
            a: '#/components/schemas/a',
            c: '#/components/schemas/a',
            b: '#/components/schemas/b',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            $ref: '#/components/schemas/b',
          },
        ],
      },
    };
    enum letters {
      a = 'a',
      c = 'c',
    }

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.nativeEnum(letters),
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

  it('creates a oneOf schema without discriminator mapping when schemas with mixed nativeEnums', () => {
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
      },
    };
    enum mixed {
      a = 'a',
      c = 'c',
      d = 1,
    }

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.nativeEnum(mixed),
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

  it('handles a discriminated union with an optional type', () => {
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
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a').optional(),
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

  it('handles a discriminated union with a nullable type', () => {
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
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a').nullable(),
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

  it('handles a discriminated union with a branded type', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        discriminator: {
          mapping: {
            a: '#/components/schemas/a',
            b: '#/components/schemas/b',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            $ref: '#/components/schemas/b',
          },
        ],
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a').brand(),
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

  it('handles a discriminated union with a branded enum type', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        discriminator: {
          mapping: {
            a: '#/components/schemas/a',
            c: '#/components/schemas/a',
            b: '#/components/schemas/b',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            $ref: '#/components/schemas/b',
          },
        ],
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.enum(['a', 'c']).brand(),
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

  it('handles a discriminated union with a readonly type', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        discriminator: {
          mapping: {
            a: '#/components/schemas/a',
            b: '#/components/schemas/b',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            $ref: '#/components/schemas/b',
          },
        ],
      },
    };
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a').readonly(),
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

  it('handles a discriminated union with a catch type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a').catch('a'),
        })
        .openapi({ ref: 'a' }),
      z
        .object({
          type: z.literal('b'),
        })
        .openapi({ ref: 'b' }),
    ]);

    const result = createDiscriminatedUnionSchema(schema, createOutputState());

    expect(result).toEqual<Schema>({
      type: 'schema',
      schema: {
        discriminator: {
          mapping: {
            a: '#/components/schemas/a',
            b: '#/components/schemas/b',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/a',
          },
          {
            $ref: '#/components/schemas/b',
          },
        ],
      },
      effects: [
        {
          type: 'component',
          path: ['discriminated union option 0'],
          zodType: schema.options[0],
        },
      ],
    });
  });
});
