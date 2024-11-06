import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createInputState, createOutputState } from '../../../testing/state';

import { createObjectSchema } from './object';

describe('createObjectSchema', () => {
  it('creates a simple object with required and optionals', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
        required: ['a'],
      },
    };
    const schema = z.object({
      a: z.string(),
      b: z.string().optional(),
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a object with strict', () => {
    const expected: Schema = {
      type: 'schema',
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
    };
    const schema = z.strictObject({
      a: z.string(),
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('supports catchall', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
        },
        required: ['a'],
        additionalProperties: { type: 'boolean' },
      },
    };
    const schema = z
      .object({
        a: z.string(),
      })
      .catchall(z.boolean());

    expect(createObjectSchema(schema, undefined, createOutputState())).toEqual(
      expected,
    );
  });

  it('considers ZodDefault in an input state as an effect', () => {
    const schema = z.object({
      a: z.string().default('a'),
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
      },
      effects: [
        {
          type: 'schema',
          creationType: 'input',
          zodType: schema.shape.a,
          path: ['property: a'],
        },
      ],
    };

    const result = createObjectSchema(schema, undefined, createInputState());

    expect(result).toEqual(expected);
  });

  it('considers ZodCatch in an input state as an effect', () => {
    const schema = z.object({
      a: z.string().catch('a'),
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
      },
      effects: [
        {
          type: 'schema',
          creationType: 'input',
          zodType: schema.shape.a,
          path: ['property: a'],
        },
      ],
    };

    const result = createObjectSchema(schema, undefined, createInputState());

    expect(result).toEqual(expected);
  });

  it('considers ZodDefault in an output state as an effect', () => {
    const schema = z.object({
      a: z.string().default('a'),
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
        required: ['a'],
      },
      effects: [
        {
          type: 'schema',
          creationType: 'output',
          zodType: schema.shape.a,
          path: ['property: a'],
        },
      ],
    };

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('considers ZodCatch in an output state as an effect', () => {
    const schema = z.object({
      a: z.string().catch('a'),
    });

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string', default: 'a' },
        },
        required: ['a'],
      },
      effects: [
        {
          type: 'schema',
          creationType: 'output',
          zodType: schema.shape.a,
          path: ['property: a'],
        },
      ],
    };

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
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

      const result = createObjectSchema(schema, undefined, createOutputState());

      expect(result).toEqual<Schema>({
        effects: expect.any(Array),
        type: 'schema',
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { type: ['string', 'null'] },
            c: { type: 'number' },
            d: { type: 'null' },
            e: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            f: {},
            g: { type: 'string', default: 'a' },
            h: { type: 'string', default: 'a' },
          },
          required: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
        },
      });
    });

    it('does not create an required array', () => {
      const ref = z.string().openapi({ ref: 'ref' });
      const oref = z.string().optional().openapi({ ref: 'oref' });
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

      const result = createObjectSchema(schema, undefined, createOutputState());

      expect(result).toEqual<Schema>({
        effects: expect.any(Array),
        type: 'schema',
        schema: {
          type: 'object',
          properties: {
            d: { type: 'string' },
            e: { type: ['string', 'null'] },
            f: { type: 'number' },
            g: { anyOf: [{ type: 'string' }] },
            h: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            i: { $ref: '#/components/schemas/ref' },
            j: { $ref: '#/components/schemas/oref' },
            k: {},
            l: { type: 'number' },
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

      const result = createObjectSchema(schema, undefined, createInputState());

      expect(result).toEqual<Schema>({
        type: 'schema',
        schema: {
          type: 'object',
          properties: {
            a: { type: 'string' },
            b: { type: ['string', 'null'] },
            c: { type: 'number' },
            d: { type: 'null' },
            e: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            f: {},
          },
          required: ['a', 'b', 'c', 'd', 'e', 'f'],
        },
      });
    });

    it('does not create an required array', () => {
      const ref = z.string().openapi({ ref: 'ref' });
      const oref = z.string().optional().openapi({ ref: 'oref' });
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
      });

      const result = createObjectSchema(schema, undefined, createInputState());

      expect(result).toEqual<Schema>({
        effects: expect.any(Array),
        type: 'schema',
        schema: {
          type: 'object',
          properties: {
            d: { type: 'string' },
            e: { type: ['string', 'null'] },
            f: { type: 'number' },
            g: { anyOf: [{ type: 'string' }] },
            h: { anyOf: [{ type: 'string' }, { type: 'number' }] },
            i: { $ref: '#/components/schemas/ref' },
            j: { $ref: '#/components/schemas/oref' },
            k: {},
            l: { type: 'string' },
            m: { type: 'string', default: 'a' },
          },
        },
      });
    });
  });
});

describe('extend', () => {
  it('creates an extended object', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          obj1: { $ref: '#/components/schemas/obj1' },
          obj2: {
            allOf: [{ $ref: '#/components/schemas/obj1' }],
            properties: { b: { type: 'string' } },
            required: ['b'],
          },
        },
        required: ['obj1', 'obj2'],
      },
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'obj1' });
    const object2 = object1.extend({ b: z.string() });
    const schema = z.object({
      obj1: object1,
      obj2: object2,
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('does not create an allOf schema when the base object has a catchall', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          obj1: { $ref: '#/components/schemas/obj1' },
          obj2: {
            type: 'object',
            properties: { a: { type: 'string' }, b: { type: 'number' } },
            required: ['a', 'b'],
            additionalProperties: {
              type: 'boolean',
            },
          },
        },
        required: ['obj1', 'obj2'],
      },
    };
    const object1 = z
      .object({ a: z.string() })
      .catchall(z.boolean())
      .openapi({ ref: 'obj1' });
    const object2 = object1.extend({ b: z.number() });
    const schema = z.object({
      obj1: object1,
      obj2: object2,
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates an allOf schema when catchall is on the extended object', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          obj1: { $ref: '#/components/schemas/obj1' },
          obj2: {
            allOf: [{ $ref: '#/components/schemas/obj1' }],
            properties: { b: { type: 'number' } },
            required: ['b'],
            additionalProperties: {
              type: 'boolean',
            },
          },
        },
        required: ['obj1', 'obj2'],
      },
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'obj1' });
    const object2 = object1.extend({ b: z.number() }).catchall(z.boolean());
    const schema = z.object({
      obj1: object1,
      obj2: object2,
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('auto registers the base of an extended object', () => {
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'obj1' });
    const object2 = object1.extend({ b: z.string() });
    const schema = z.object({
      obj1: object1,
      obj2: object2,
    });

    const state = createOutputState();
    createObjectSchema(schema, undefined, state);

    expect(state.components.schemas.get(object1)?.ref).toBe('obj1');
    expect(state.components.schemas.get(object1)?.type).toBe('complete');
  });

  it('does not create an allOf schema when the extension overrides a field', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          obj1: { $ref: '#/components/schemas/obj1' },
          obj2: {
            type: 'object',
            properties: { a: { type: 'number' } },
            required: ['a'],
          },
        },
        required: ['obj1', 'obj2'],
      },
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'obj1' });
    const object2 = object1.extend({ a: z.number() });
    const schema = z.object({
      obj1: object1,
      obj2: object2,
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates an object with 2 required fields using a custom type', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: {
            type: 'string',
          },
          b: {
            type: 'string',
            format: 'date',
          },
        },
        required: ['a', 'b'],
      },
    };
    const zodDate = z
      .union([
        z.custom<Date>((val: unknown) => val instanceof Date),
        z.string().transform((str: string): Date => new Date(str)), // ignore validation
      ])
      .openapi({
        type: 'string',
        format: 'date',
      });

    const schema = z.object({
      a: z.string(),
      b: zodDate,
    });

    const result = createObjectSchema(schema, undefined, createOutputState());

    expect(result).toEqual(expected);
  });
});
