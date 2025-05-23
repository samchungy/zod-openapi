import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';
import type { ZodOpenApiComponentsObject } from '../../document';

describe('discriminatedUnion', () => {
  it('creates a oneOf schema', () => {
    const expected: oas31.SchemaObject = {
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
    };

    const schema = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('a'),
      }),
      z.object({
        type: z.literal('b'),
      }),
    ]);

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas are registered', () => {
    const expected: oas31.SchemaObject = {
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with enums are registered', () => {
    const expected: oas31.SchemaObject = {
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

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

    const expected: oas31.SchemaObject = {
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
    };

    const schema = z.discriminatedUnion('type', [c, d]);
    const state = createOutputState(components);

    const result = createSchema(schema, state, ['discriminatedUnion']);

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with string nativeEnums', () => {
    const expected: oas31.SchemaObject = {
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
    };

    enum Letters {
      a = 'a',
      c = 'c',
    }

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.nativeEnum(Letters),
        })
        .openapi({ ref: 'a' }),
      z
        .object({
          type: z.literal('b'),
        })
        .openapi({ ref: 'b' }),
    ]);

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema without discriminator mapping when schemas with mixed nativeEnums', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          $ref: '#/components/schemas/a',
        },
        {
          $ref: '#/components/schemas/b',
        },
      ],
    };

    enum Mixed {
      a = 'a',
      c = 'c',
      d = 1,
    }

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.nativeEnum(Mixed),
        })
        .openapi({ ref: 'a' }),
      z
        .object({
          type: z.literal('b'),
        })
        .openapi({ ref: 'b' }),
    ]);

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('handles a discriminated union with an optional type', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          $ref: '#/components/schemas/a',
        },
        {
          $ref: '#/components/schemas/b',
        },
      ],
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('handles a discriminated union with a nullable type', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          $ref: '#/components/schemas/a',
        },
        {
          $ref: '#/components/schemas/b',
        },
      ],
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('handles a discriminated union with a branded type', () => {
    const expected: oas31.SchemaObject = {
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('handles a discriminated union with a branded enum type', () => {
    const expected: oas31.SchemaObject = {
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('handles a discriminated union with a readonly type', () => {
    const expected: oas31.SchemaObject = {
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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

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

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual<oas31.SchemaObject>({
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
    });
  });

  it('throws an error if enforceDiscriminatedUnionComponents is specified and a schema is not registered', () => {
    const schema = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('a'),
      }),
      z
        .object({
          type: z.literal('b'),
        })
        .openapi({ ref: 'b' }),
    ]);

    expect(() =>
      createSchema(
        schema,
        {
          ...createOutputState(
            {},
            { enforceDiscriminatedUnionComponents: true },
          ),
          path: ['some', 'path'],
        },
        ['discriminatedUnion'],
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Discriminated Union member 0 at some > path > discriminatedUnion is not registered as a component"`,
    );
  });
});
