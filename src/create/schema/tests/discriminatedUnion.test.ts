import { z } from 'zod/v4';

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
          additionalProperties: false,
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
          additionalProperties: false,
        },
      ],
      type: 'object',
      discriminator: {
        propertyName: 'type',
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
      type: 'object',
    };

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a'),
        })
        .meta({ id: 'a' }),
      z
        .object({
          type: z.literal('b'),
        })
        .meta({ id: 'b' }),
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
      type: 'object',
    };

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('c'),
        })
        .meta({ id: 'c' }),
      z
        .object({
          type: z.enum(['d', 'e']),
        })
        .meta({ id: 'd' }),
    ]);

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with enums are registered manually', () => {
    const f = z.object({
      type: z.literal('f'),
    });

    const g = z.object({
      type: z.enum(['g', 'h']),
    });

    const components: ZodOpenApiComponentsObject = {
      schemas: {
        f,
        g,
      },
    };

    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          $ref: '#/components/schemas/f',
        },
        {
          $ref: '#/components/schemas/g',
        },
      ],
      discriminator: {
        propertyName: 'type',
        mapping: {
          f: '#/components/schemas/f',
          g: '#/components/schemas/g',
          h: '#/components/schemas/g',
        },
      },
    };

    const schema = z.discriminatedUnion('type', [f, g]);
    const state = createOutputState(components);

    const result = createSchema(schema, state, ['discriminatedUnion']);

    expect(result).toEqual(expected);
  });

  it('creates a oneOf schema with discriminator mapping when schemas with string nativeEnums', () => {
    const expected: oas31.SchemaObject = {
      discriminator: {
        mapping: {
          i: '#/components/schemas/i',
          j: '#/components/schemas/j',
          k: '#/components/schemas/i',
        },
        propertyName: 'type',
      },
      oneOf: [
        {
          $ref: '#/components/schemas/i',
        },
        {
          $ref: '#/components/schemas/j',
        },
      ],
      type: 'object',
    };

    enum Letters {
      i = 'i',
      k = 'k',
    }

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.enum(Letters),
        })
        .meta({ id: 'i' }),
      z
        .object({
          type: z.literal('j'),
        })
        .meta({ id: 'j' }),
    ]);

    const result = createSchema(schema, createOutputState(), [
      'discriminatedUnion',
    ]);

    expect(result).toEqual(expected);
  });

  // it('creates a oneOf schema without discriminator mapping when schemas with mixed nativeEnums', () => {
  //   const expected: oas31.SchemaObject = {
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   };

  //   enum Mixed {
  //     a = 'a',
  //     c = 'c',
  //     d = 1,
  //   }

  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.nativeEnum(Mixed),
  //       })
  //       .meta({ id: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .meta({ id: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual(expected);
  // });

  // it('handles a discriminated union with an optional type', () => {
  //   const expected: oas31.SchemaObject = {
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   };

  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.literal('a').optional(),
  //       })
  //       .meta({ id: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .meta({ id: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual(expected);
  // });

  // it('handles a discriminated union with a nullable type', () => {
  //   const expected: oas31.SchemaObject = {
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   };

  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.literal('a').nullable(),
  //       })
  //       .meta({ id: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .meta({ id: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual(expected);
  // });

  // it('handles a discriminated union with a branded type', () => {
  //   const expected: oas31.SchemaObject = {
  //     discriminator: {
  //       mapping: {
  //         a: '#/components/schemas/a',
  //         b: '#/components/schemas/b',
  //       },
  //       propertyName: 'type',
  //     },
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   };

  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.literal('a').brand(),
  //       })
  //       .meta({ id: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .meta({ id: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual(expected);
  // });

  // it('handles a discriminated union with a branded enum type', () => {
  //   const expected: oas31.SchemaObject = {
  //     discriminator: {
  //       mapping: {
  //         a: '#/components/schemas/a',
  //         c: '#/components/schemas/a',
  //         b: '#/components/schemas/b',
  //       },
  //       propertyName: 'type',
  //     },
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   };

  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.enum(['a', 'c']).brand(),
  //       })
  //       .openapi({ ref: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .openapi({ ref: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual(expected);
  // });

  // it('handles a discriminated union with a readonly type', () => {
  //   const expected: oas31.SchemaObject = {
  //     discriminator: {
  //       mapping: {
  //         a: '#/components/schemas/a',
  //         b: '#/components/schemas/b',
  //       },
  //       propertyName: 'type',
  //     },
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   };

  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.literal('a').readonly(),
  //       })
  //       .openapi({ ref: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .openapi({ ref: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual(expected);
  // });

  // it('handles a discriminated union with a catch type', () => {
  //   const schema = z.discriminatedUnion('type', [
  //     z
  //       .object({
  //         type: z.literal('a').catch('a'),
  //       })
  //       .openapi({ ref: 'a' }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .openapi({ ref: 'b' }),
  //   ]);

  //   const result = createSchema(schema, createOutputState(), [
  //     'discriminatedUnion',
  //   ]);

  //   expect(result).toEqual<oas31.SchemaObject>({
  //     discriminator: {
  //       mapping: {
  //         a: '#/components/schemas/a',
  //         b: '#/components/schemas/b',
  //       },
  //       propertyName: 'type',
  //     },
  //     oneOf: [
  //       {
  //         $ref: '#/components/schemas/a',
  //       },
  //       {
  //         $ref: '#/components/schemas/b',
  //       },
  //     ],
  //   });
  // });

  // it('throws an error if enforceDiscriminatedUnionComponents is specified and a schema is not registered', () => {
  //   const schema = z.discriminatedUnion('type', [
  //     z.object({
  //       type: z.literal('a'),
  //     }),
  //     z
  //       .object({
  //         type: z.literal('b'),
  //       })
  //       .openapi({ ref: 'b' }),
  //   ]);

  //   expect(() =>
  //     createSchema(
  //       schema,
  //       {
  //         ...createOutputState(
  //           {},
  //           { enforceDiscriminatedUnionComponents: true },
  //         ),
  //         path: ['some', 'path'],
  //       },
  //       ['discriminatedUnion'],
  //     ),
  //   ).toThrowErrorMatchingInlineSnapshot(
  //     `"Discriminated Union member 0 at some > path > discriminatedUnion is not registered as a component"`,
  //   );
  // });
});
