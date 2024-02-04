import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createOutputState } from '../../../testing/state';

import { createObjectSchema } from './object';

extendZodWithOpenApi(z);

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

    const result = createObjectSchema(schema, createOutputState());

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

    const result = createObjectSchema(schema, createOutputState());

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

    expect(createObjectSchema(schema, createOutputState())).toEqual(expected);
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
            type: 'object',
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

    const result = createObjectSchema(schema, createOutputState());

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

    const result = createObjectSchema(schema, createOutputState());

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
            type: 'object',
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

    const result = createObjectSchema(schema, createOutputState());

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
    createObjectSchema(schema, state);

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

    const result = createObjectSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('ignores ZodNever and ZodUndefined schemas', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
        },
        required: ['a'],
      },
    };
    const schema = z.object({ a: z.string(), b: z.undefined(), c: z.never() });

    const result = createObjectSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
