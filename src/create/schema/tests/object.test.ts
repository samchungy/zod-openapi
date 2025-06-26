import { z } from 'zod/v4';

import { createInputContext, createOutputContext } from '../../../testing/ctx';
import { type SchemaResult, createSchema } from '../schema';

describe('object', () => {
  it('creates a simple object with required and optionals', () => {
    const schema = z.object({
      a: z.string(),
      b: z.string().optional(),
    });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
        required: ['a'],
        additionalProperties: false,
      },
      components: {},
    });
  });

  it('creates a object with strict', () => {
    const schema = z.strictObject({
      a: z.string(),
    });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
        },
        required: ['a'],
        additionalProperties: false,
      },
      components: {},
    });
  });

  it('supports passthrough', () => {
    const schema = z.looseObject({
      a: z.string(),
    });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
        },
        required: ['a'],
        additionalProperties: {},
      },
      components: {},
    });
  });

  it('supports catchall', () => {
    const schema = z
      .object({
        a: z.string(),
      })
      .catchall(z.boolean());

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
        },
        required: ['a'],
        additionalProperties: { type: 'boolean' },
      },
      components: {},
    });
  });

  it('considers ZodDefault in an input state', () => {
    const schema = z.object({
      a: z.string().default('a'),
    });

    const ctx = createOutputContext();
    ctx.io = 'input' as any;

    const result = createSchema(schema, ctx);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
      },
      components: {},
    });
  });

  // colinhacks/zod#4769
  it.skip('considers ZodCatch in an input state', () => {
    const schema = z.object({
      a: z.string().catch('a'),
    });

    const ctx = createInputContext();

    const result = createSchema(schema, ctx);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
      },
      components: {},
    });
  });

  it('considers ZodDefault in an output state', () => {
    const schema = z.object({
      a: z.string().default('a'),
    });

    const ctx = createOutputContext();
    const result = createSchema(schema, ctx);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
        required: ['a'],
        additionalProperties: false,
      },
      components: {},
    });
  });

  it('considers ZodCatch in an output state', () => {
    const schema = z.object({
      a: z.string().catch('a'),
    });

    const ctx = createOutputContext();
    const result = createSchema(schema, ctx);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
        required: ['a'],
        additionalProperties: false,
      },
      components: {},
    });
  });
});

describe('required', () => {
  describe('output', () => {
    it('creates a required array containing all properties', () => {
      const schema = z.object({
        a: z.string(),
        b: z.string().nullable(),
        c: z.number(),
        d: z.literal(null),
        e: z.union([z.string(), z.number()]),
        f: z.custom((r) => r !== undefined),
        g: z.string().default('a'),
        h: z.string().catch('a'),
      });

      const ctx = createOutputContext();
      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            c: { type: 'number' },
            d: { const: null, type: 'null' },
            e: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            f: {},
            g: { type: 'string', default: 'a' },
            h: { type: 'string', default: 'a' },
          },
          required: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
          additionalProperties: false,
        },
        components: {},
      });
    });

    it.skip('does not create an required array', () => {
      const ref = z.string().meta({ id: 'ref' });
      const oref = z.string().optional().meta({ id: 'oref' });
      const schema = z.object({
        a: z.literal(undefined),
        b: z.never(),
        c: z.undefined(),
        d: z.string().optional(),
        e: z.string().nullish(),
        f: z.number().optional(),
        g: z.union([z.string(), z.undefined()]),
        h: z.union([z.string(), z.number().optional()]),
        i: ref.optional(),
        j: oref,
        k: z.custom<string | undefined>(),
        l: z
          .string()
          .optional()
          .transform((str) => str?.length)
          .pipe(z.number().optional()),
      });

      const ctx = createOutputContext();
      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'object',
          properties: {
            d: { type: 'string' },
            e: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            f: { type: 'number' },
            g: { anyOf: [{ type: 'string' }] },
            h: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            i: { $ref: '#/components/schemas/ref' },
            j: { $ref: '#/components/schemas/oref' },
            k: {},
            l: { type: 'number' },
          },
          additionalProperties: false,
        },
        components: {
          ref: {
            type: 'string',
          },
          oref: {
            type: 'string',
          },
        },
      });
    });
  });

  describe('input', () => {
    it('creates a required array containing all properties', () => {
      const schema = z.object({
        a: z.string(),
        b: z.string().nullable(),
        c: z.number(),
        d: z.literal(null),
        e: z.union([z.string(), z.number()]),
        f: z.custom((r) => r !== undefined),
      });

      const ctx = createOutputContext();
      ctx.io = 'input' as any;
      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { anyOf: [{ type: 'string' }, { type: 'null' }] },
            c: { type: 'number' },
            d: { type: 'null', const: null },
            e: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            f: {},
          },
          required: ['a', 'b', 'c', 'd', 'e', 'f'],
        },
        components: {},
      });
    });

    // colinhacks/zod#4768
    it.skip('does not create an required array', () => {
      const ref = z.string().meta({ id: 'ref1' });
      const oref = z.string().optional().meta({ id: 'oref1' });
      const schema = z.object({
        a: z.literal(undefined),
        b: z.never(),
        c: z.undefined(),
        d: z.string().optional(),
        e: z.string().nullish(),
        f: z.number().optional(),
        g: z.union([z.string(), z.undefined()]),
        h: z.union([z.string(), z.number().optional()]),
        i: ref.optional(),
        j: oref,
        k: z.custom<string | undefined>(),
        l: z
          .string()
          .optional()
          .transform((str) => str?.length)
          .pipe(z.number().optional()),
        m: z.string().default('a'),
        n: z.undefined().optional(),
      });

      const ctx = createInputContext();
      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'object',
          properties: {
            d: { type: 'string' },
            e: { type: ['string', 'null'] },
            f: { type: 'number' },
            g: { anyOf: [{ type: 'string' }] },
            h: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            i: { $ref: '#/components/schemas/ref1' },
            j: { $ref: '#/components/schemas/oref1' },
            k: {},
            l: { type: 'string' },
            m: { type: 'string', default: 'a' },
          },
        },
        components: {
          ref1: {
            type: 'string',
          },
          oref1: {
            type: 'string',
          },
        },
      });
    });
  });
});
