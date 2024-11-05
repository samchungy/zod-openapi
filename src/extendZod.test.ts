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

    expect(a._def.openapi?.description).toBe('test');
    expect(b._def.openapi?.description).toBe('test2');
    expect(b._def.previous?._def.openapi?.description).toBe('test');
  });

  it('adds ._def.openapi fields to a zod type', () => {
    const a = z.string().openapi({ description: 'a' });
    const b = z.number().openapi({ examples: [1] });

    expect(a._def.openapi?.description).toBe('a');
    expect(b._def.openapi?.examples).toStrictEqual([1]);
  });

  it('adds persists .openapi() across some methods', () => {
    const a = z.string().openapi({ description: 'a' }).uuid();

    expect(a._def.openapi?.description).toBe('a');
  });

  it('adds extendsMetadata to an object when .extend is used', () => {
    const a = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const b = a.extend({ b: z.string() });

    expect(a._def.openapi?.ref).toBe('a');
    expect(b._def?.previous).toStrictEqual(a);
  });

  it('adds removes extendsMetadata to an object when .omit or .pick is used', () => {
    const a = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const b = a.extend({ b: z.string() });
    const c = b.pick({ a: true });
    const d = b.omit({ a: true });

    expect(a._def.openapi?.ref).toBe('a');
    expect(b._def.previous).toStrictEqual(a);
    expect(c._def.openapi).toBeUndefined();
    expect(d._def.openapi).toBeUndefined();
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
});
