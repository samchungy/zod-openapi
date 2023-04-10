import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createObjectSchema } from './object';

extendZodWithOpenApi(z);

describe('createObjectSchema', () => {
  it('creates a simple object with required and optionals', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
      required: ['a'],
    };
    const result = createObjectSchema(
      z.object({
        a: z.string(),
        b: z.string().optional(),
      }),
    );

    expect(result).toEqual(expected);
  });

  it('creates a object with strict', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        a: {
          type: 'string',
        },
      },
      required: ['a'],
      additionalProperties: true,
    };
    const result = createObjectSchema(
      z.strictObject({
        a: z.string(),
      }),
    );

    expect(result).toEqual(expected);
  });

  it('creates an extended object', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        obj1: { $ref: '#/components/schemas/obj1' },
        obj2: {
          allOf: [
            { $ref: '#/components/schemas/obj1' },
            {
              type: 'object',
              properties: { b: { type: 'string' } },
              required: ['b'],
            },
          ],
        },
      },
      required: ['obj1', 'obj2'],
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'obj1' });
    const object2 = object1.extend({ b: z.string() });
    const result = createObjectSchema(
      z.object({
        obj1: object1,
        obj2: object2,
      }),
    );

    expect(result).toEqual(expected);
  });
});
