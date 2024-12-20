import { z } from 'zod';

import { createSchema } from './create/schema/single';
import { extendZodWithOpenApi } from './extendZod';
import { currentSymbol, previousSymbol } from './extendZodTypes';

extendZodWithOpenApi(z);

describe('extendZodWithOpenApi', () => {
  it('allows .openapi() to be added to Zod Types', () => {
    const run = () => {
      z.string().openapi({ description: 'test' });
      z.object({ a: z.string() }).openapi({ description: 'test2' });
    };

    expect(() => run()).not.toThrow();
  });

  it('allows .openapi() to be chained in Zod Types', () => {
    const a = z.string().openapi({ description: 'test' });
    const b = a.openapi({ description: 'test2' });

    expect(a._def.zodOpenApi?.openapi?.description).toBe('test');
    expect(b._def.zodOpenApi?.openapi?.description).toBe('test2');
    expect(
      b._def.zodOpenApi?.[previousSymbol]?._def.zodOpenApi?.openapi?.description,
    ).toBe('test');
  });

  it('sets current metadata when a schema is used again', () => {
    const a = z.string().openapi({ ref: 'a' });
    const b = a.uuid();

    expect(a._def.zodOpenApi?.[currentSymbol]).toBe(a);
    expect(b._def.zodOpenApi?.[currentSymbol]).toBe(a);
  });

  it('adds ._def.zodOpenApi.openapi fields to a zod type', () => {
    const a = z.string().openapi({ description: 'a' });
    const b = z.number().openapi({ examples: [1] });

    expect(a._def.zodOpenApi?.openapi?.description).toBe('a');
    expect(b._def.zodOpenApi?.openapi?.examples).toStrictEqual([1]);
  });

  it('adds persists .openapi() across some methods', () => {
    const a = z.string().openapi({ description: 'a' }).uuid();

    expect(a._def.zodOpenApi?.openapi?.description).toBe('a');
  });

  it('adds extendsMetadata to an object when .extend is used', () => {
    const a = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const b = a.extend({ b: z.string() });

    expect(a._def.zodOpenApi?.openapi?.ref).toBe('a');
    expect(b._def.zodOpenApi?.[previousSymbol]).toStrictEqual(a);
  });

  it('removes previous openapi ref for an object when .omit or .pick is used', () => {
    const a = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const b = a.extend({ b: z.string() });
    const c = b.pick({ a: true });
    const d = b.omit({ a: true });
    const e = b.pick({ a: true }).openapi({ ref: 'e' });
    const f = b.omit({ a: true }).openapi({ ref: 'f' });

    const object = z.object({
      a,
      b,
      c,
      d,
      e,
      f,
    });

    expect(a._def.zodOpenApi?.openapi?.ref).toBe('a');
    expect(b._def.zodOpenApi?.[previousSymbol]).toStrictEqual(a);
    expect(c._def.zodOpenApi?.openapi).toEqual({});
    expect(d._def.zodOpenApi?.openapi).toEqual({});

    const schema = createSchema(object);

    expect(schema).toEqual({
      components: {
        a: {
          properties: {
            a: {
              type: 'string',
            },
          },
          required: ['a'],
          type: 'object',
        },
        e: {
          properties: {
            a: {
              type: 'string',
            },
          },
          required: ['a'],
          type: 'object',
        },
        f: {
          properties: {
            b: {
              type: 'string',
            },
          },
          required: ['b'],
          type: 'object',
        },
      },
      schema: {
        properties: {
          a: {
            $ref: '#/components/schemas/a',
          },
          b: {
            allOf: [
              {
                $ref: '#/components/schemas/a',
              },
            ],
            properties: {
              b: {
                type: 'string',
              },
            },
            required: ['b'],
          },
          c: {
            properties: {
              a: {
                type: 'string',
              },
            },
            required: ['a'],
            type: 'object',
          },
          d: {
            properties: {
              b: {
                type: 'string',
              },
            },
            required: ['b'],
            type: 'object',
          },
          e: {
            $ref: '#/components/schemas/e',
          },
          f: {
            $ref: '#/components/schemas/f',
          },
        },
        required: ['a', 'b', 'c', 'd', 'e', 'f'],
        type: 'object',
      },
    });
  });

  it("allows 'same' effectType when the input and output are equal", () => {
    z.string()
      .transform((string) => string.toUpperCase())
      .openapi({ effectType: 'same' });

    z.string()
      .transform((string) => string.length)
      // @ts-expect-error - This is to test the effectType
      .openapi({ effectType: 'same' });
  });

  it('preserves properties when using .openapi consecutively', () => {
    const fooString = z
      .string()
      .regex(/^foo/)
      .transform((string) => string.toUpperCase())
      .openapi({ effectType: 'input' });

    const barString = fooString.openapi({ description: 'foo' });

    expect(barString._def.zodOpenApi?.openapi?.effectType).toBe('input');
  });

  it('makes a date example accept strings', () => {
    const fooString = z.union([z.date().optional(), z.string(), z.null()]);

    const barString = fooString.openapi({
      examples: [null, '2021-01-01'],
    });

    expect(barString._def.zodOpenApi?.openapi?.examples).toEqual([
      null,
      '2021-01-01',
    ]);
  });

  it('makes allows example to accept undefined but forbids undefined in examples', () => {
    const fooString = z.union([z.date().optional(), z.string(), z.null()]);

    const barString = fooString.openapi({
      example: undefined,
      // @ts-expect-error - Testing types
      examples: [undefined],
    });

    expect(barString._def.zodOpenApi?.openapi?.example).toBeUndefined();
  });
});
