import { z } from 'zod';

import { extendZodWithOpenApi } from './extendZod';

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
      b._def.zodOpenApi?.previous?._def.zodOpenApi?.openapi?.description,
    ).toBe('test');
  });

  it('sets current metadata when a schema is used again', () => {
    const a = z.string().openapi({ ref: 'a' });
    const b = a.uuid();

    expect(a._def.zodOpenApi?.current).toBe(a);
    expect(b._def.zodOpenApi?.current).toBe(a);
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
    expect(b._def.zodOpenApi?.previous).toStrictEqual(a);
  });

  it('removes previous openapi ref for an object when .omit or .pick is used', () => {
    const a = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const b = a.extend({ b: z.string() });
    const c = b.pick({ a: true });
    const d = b.omit({ a: true });

    expect(a._def.zodOpenApi?.openapi?.ref).toBe('a');
    expect(b._def.zodOpenApi?.previous).toStrictEqual(a);
    expect(c._def.zodOpenApi?.openapi).toEqual({});
    expect(d._def.zodOpenApi?.openapi).toEqual({});
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

  it('makes a date input accept strings', () => {
    const fooString = z.union([z.date().optional(), z.string(), z.null()]);

    const barString = fooString.openapi({
      description: 'foo',
      examples: [null, '2021-01-01'],
    });

    expect(barString._def.zodOpenApi?.openapi?.effectType).toBe('input');
  });
});
