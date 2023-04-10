import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createSchemaWithMetadata } from './metadata';

extendZodWithOpenApi(z);

describe('createSchemaWithMetadata', () => {
  it('adds .openapi metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      description: 'bla',
    };
    const result = createSchemaWithMetadata(
      z.string().openapi({ description: 'bla' }),
    );

    expect(result).toEqual(expected);
  });

  it('adds .describe metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      description: 'bla',
    };
    const result = createSchemaWithMetadata(z.string().describe('bla'));

    expect(result).toEqual(expected);
  });

  it('overrides .describe metadata with .openapi metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      description: 'foo',
    };
    const result = createSchemaWithMetadata(
      z.string().describe('bla').openapi({ description: 'foo' }),
    );

    expect(result).toEqual(expected);
  });

  it('overrides type with .openapi type metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
    };
    const result = createSchemaWithMetadata(
      z.string().openapi({ type: 'integer' }),
    );

    expect(result).toEqual(expected);
  });

  it('adds allOf to $refs', () => {
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          $ref: '#/components/schemas/ref',
        },
        {
          description: 'hello',
        },
      ],
    };

    const ref = z.string().openapi({ ref: 'ref' });

    const result = createSchemaWithMetadata(
      ref.optional().openapi({ description: 'hello' }),
    );

    expect(result).toEqual(expected);
  });

  it('adds allOf to $refs only if there is new metadata', () => {
    const expected: oas31.ReferenceObject = {
      $ref: '#/components/schemas/og',
    };

    const ref = z.string().openapi({ ref: 'og' });

    const result = createSchemaWithMetadata(ref.optional());

    expect(result).toEqual(expected);
  });

  it('adds to a registered schema', () => {
    const expected: oas31.SchemaObject = {
      allOf: [{ $ref: '#/components/schemas/ref2' }, { default: 'a' }],
    };

    const ref = z.string().openapi({ ref: 'ref2' });

    const result = createSchemaWithMetadata(ref.optional().default('a'));

    expect(result).toEqual(expected);
  });

  it('adds to the last element of an allOf schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        b: {
          allOf: [
            { $ref: '#/components/schemas/a' },
            {
              type: 'object',
              properties: { b: { type: 'string' } },
              required: ['b'],
              description: 'jello',
            },
          ],
        },
      },
      required: ['b'],
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const object2 = object1.extend({ b: z.string() });

    const result = createSchemaWithMetadata(
      z.object({
        b: object2.openapi({ description: 'jello' }),
      }),
    );

    expect(result).toEqual(expected);
  });
});
