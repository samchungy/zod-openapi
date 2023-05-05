import { type ZodLazy, z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createLazySchema } from './lazy';

extendZodWithOpenApi(z);

describe('createLazySchema', () => {
  it('creates an lazy schema when the schema contains a ref', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: { $ref: '#/components/schemas/lazy' },
    };
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z
      .lazy(() => lazy.array())
      .openapi({ ref: 'lazy' });

    const result = createLazySchema(lazy as ZodLazy<any>, createOutputState());
    expect(result).toStrictEqual(expected);
  });

  it('creates an lazy schema when the schema is the components as lazy', () => {
    const expected: oas31.ReferenceObject = {
      $ref: '#/components/schemas/lazy',
    };
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());
    const state = createOutputState();
    state.components.schemas.set(lazy, {
      ref: 'lazy',
      type: 'lazy',
    });

    const result = createLazySchema(lazy as ZodLazy<any>, state);
    expect(result).toStrictEqual(expected);
  });

  it('creates an lazy schema when the schema is the components as partial', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: { $ref: '#/components/schemas/lazy' },
    };
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());
    const state = createOutputState();
    state.components.schemas.set(lazy, {
      ref: 'lazy',
      type: 'partial',
    });

    const result = createLazySchema(lazy as ZodLazy<any>, state);
    expect(result).toStrictEqual(expected);
  });

  it('throws an error when the schema does not have a ref', () => {
    type Lazy = Lazy[];
    const lazy: z.ZodType<Lazy> = z.lazy(() => lazy.array());

    expect(() =>
      createLazySchema(lazy as ZodLazy<any>, createOutputState()),
    ).toThrow(`Please register the ${JSON.stringify(lazy._def)} type`);
  });
});
