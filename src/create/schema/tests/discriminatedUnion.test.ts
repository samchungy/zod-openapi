import * as z from 'zod/v4';

import { createOutputContext } from '../../../testing/ctx';
import { createRegistry } from '../../components';
import type { ZodOpenApiComponentsObject } from '../../document';
import { type SchemaResult, createSchema } from '../schema';

describe('discriminatedUnion', () => {
  it('creates a oneOf schema with discriminator mapping when schemas are registered', () => {
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

    const ctx = createOutputContext();
    const result = createSchema(schema, ctx);

    expect(result).toEqual<SchemaResult>({
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
        type: 'object',
      },
      components: {
        a: {
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
        b: {
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
      },
    });
  });

  it('creates a oneOf schema with discriminator mapping when schemas with enums are registered', () => {
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

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
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
        type: 'object',
      },
      components: {
        c: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'c',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        d: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['d', 'e'],
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
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

    const schema = z.discriminatedUnion('type', [f, g]);

    const result = createSchema(schema, {
      registry: createRegistry(components),
    });

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
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
      },
      components: {
        f: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'f',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        g: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['g', 'h'],
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('creates a oneOf schema with discriminator mapping when schemas with string nativeEnums', () => {
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

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
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
      },
      components: {
        i: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['i', 'k'],
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        j: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'j',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('creates a oneOf schema without discriminator mapping when schemas with mixed nativeEnums', () => {
    enum Mixed {
      a = 'a',
      c = 'c',
      d = 1,
    }

    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.enum(Mixed),
        })
        .meta({ id: 'k' }),
      z
        .object({
          type: z.literal('b'),
        })
        .meta({ id: 'l' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        discriminator: {
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/k',
          },
          {
            $ref: '#/components/schemas/l',
          },
        ],
      },
      components: {
        k: {
          type: 'object',
          properties: {
            type: {
              enum: ['a', 'c', 1],
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        l: {
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
      },
    });
  });

  it('handles a discriminated union with an optional type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('m').optional(),
        })
        .meta({ id: 'm' }),
      z
        .object({
          type: z.literal('n'),
        })
        .meta({ id: 'n' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        oneOf: [
          {
            $ref: '#/components/schemas/m',
          },
          {
            $ref: '#/components/schemas/n',
          },
        ],
        discriminator: {
          propertyName: 'type',
        },
      },
      components: {
        n: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'n',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        m: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'm',
            },
          },
          additionalProperties: false,
        },
      },
    });
  });

  it('handles a discriminated union with a nullable type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('o').nullable(),
        })
        .meta({ id: 'o' }),
      z
        .object({
          type: z.literal('p'),
        })
        .meta({ id: 'p' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        discriminator: {
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/o',
          },
          {
            $ref: '#/components/schemas/p',
          },
        ],
      },
      components: {
        o: {
          type: 'object',
          properties: {
            type: {
              anyOf: [
                {
                  type: 'string',
                  const: 'o',
                },
                {
                  type: 'null',
                },
              ],
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        p: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'p',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('handles a discriminated union with a branded type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('q').brand(),
        })
        .meta({ id: 'q' }),
      z
        .object({
          type: z.literal('r'),
        })
        .meta({ id: 'r' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        discriminator: {
          mapping: {
            q: '#/components/schemas/q',
            r: '#/components/schemas/r',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/q',
          },
          {
            $ref: '#/components/schemas/r',
          },
        ],
      },
      components: {
        q: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'q',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        r: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'r',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('handles a discriminated union with a branded enum type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.enum(['a', 'c']).brand(),
        })
        .meta({ id: 's' }),
      z
        .object({
          type: z.literal('b'),
        })
        .meta({ id: 't' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual({
      schema: {
        type: 'object',
        discriminator: {
          mapping: {
            a: '#/components/schemas/s',
            b: '#/components/schemas/t',
            c: '#/components/schemas/s',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/s',
          },
          {
            $ref: '#/components/schemas/t',
          },
        ],
      },
      components: {
        s: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['a', 'c'],
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        t: {
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
      },
    });
  });

  it('handles a discriminated union with a readonly type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('u').readonly(),
        })
        .meta({ id: 'u' }),
      z
        .object({
          type: z.literal('v'),
        })
        .meta({ id: 'v' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        discriminator: {
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/u',
          },
          {
            $ref: '#/components/schemas/v',
          },
        ],
      },
      components: {
        u: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'u',
              readOnly: true,
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        v: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'v',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('handles a discriminated union with a catch type', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('a').catch('a'),
        })
        .meta({ id: 'w' }),
      z
        .object({
          type: z.literal('b'),
        })
        .meta({ id: 'x' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        discriminator: {
          mapping: {
            a: '#/components/schemas/w',
            b: '#/components/schemas/x',
          },
          propertyName: 'type',
        },
        oneOf: [
          {
            $ref: '#/components/schemas/w',
          },
          {
            $ref: '#/components/schemas/x',
          },
        ],
      },
      components: {
        w: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              default: 'a',
              const: 'a',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        x: {
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
      },
    });
  });

  it('should delete the discriminator mapping if any of the values are not registered', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal('foo'),
        })
        .meta({ id: 'y' }),
      z.object({
        type: z.literal('bar'),
      }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        oneOf: [
          {
            $ref: '#/components/schemas/y',
          },
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                const: 'bar',
              },
            },
            required: ['type'],
            additionalProperties: false,
          },
        ],
      },
      components: {
        y: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              const: 'foo',
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('should allow boolean discriminators', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal(true),
        })
        .meta({ id: 'true' }),
      z
        .object({
          type: z.literal(false),
        })
        .meta({ id: 'false' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        oneOf: [
          {
            $ref: '#/components/schemas/true',
          },
          {
            $ref: '#/components/schemas/false',
          },
        ],
        discriminator: {
          propertyName: 'type',
          mapping: {
            true: '#/components/schemas/true',
            false: '#/components/schemas/false',
          },
        },
      },
      components: {
        true: {
          type: 'object',
          properties: {
            type: {
              type: 'boolean',
              const: true,
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        false: {
          type: 'object',
          properties: {
            type: {
              type: 'boolean',
              const: false,
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });

  it('should allow number discriminators', () => {
    const schema = z.discriminatedUnion('type', [
      z
        .object({
          type: z.literal(1),
        })
        .meta({ id: 'one' }),
      z
        .object({
          type: z.literal(2),
        })
        .meta({ id: 'two' }),
    ]);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        oneOf: [
          {
            $ref: '#/components/schemas/one',
          },
          {
            $ref: '#/components/schemas/two',
          },
        ],
        discriminator: {
          propertyName: 'type',
          mapping: {
            one: '#/components/schemas/one',
            two: '#/components/schemas/two',
          },
        },
      },
      components: {
        one: {
          type: 'object',
          properties: {
            type: {
              type: 'number',
              const: 1,
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
        two: {
          type: 'object',
          properties: {
            type: {
              type: 'number',
              const: 2,
            },
          },
          required: ['type'],
          additionalProperties: false,
        },
      },
    });
  });
});
