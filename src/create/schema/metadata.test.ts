import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createSchemaWithMetadata } from './metadata';

extendZodWithOpenApi(z);

describe('createSchemaWithMetadata', () => {
  it('adds .openapi metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      description: 'bla',
    };
    const schema = z.string().openapi({ description: 'bla' });

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('adds .describe metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      description: 'bla',
    };
    const schema = z.string().describe('bla');

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('overrides .describe metadata with .openapi metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      description: 'foo',
    };

    const schema = z.string().describe('bla').openapi({ description: 'foo' });

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('overrides type with .openapi type metadata', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
    };
    const schema = z.string().openapi({ type: 'integer' });

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
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

    const schema = ref.optional().openapi({ description: 'hello' });

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('adds allOf to $refs only if there is new metadata', () => {
    const expected: oas31.ReferenceObject = {
      $ref: '#/components/schemas/og',
    };

    const ref = z.string().openapi({ ref: 'og' });

    const schema = ref.optional();

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('adds to a registered schema', () => {
    const expected: oas31.SchemaObject = {
      allOf: [{ $ref: '#/components/schemas/ref2' }, { default: 'a' }],
    };

    const ref = z.string().openapi({ ref: 'ref2' });
    const schema = ref.optional().default('a');

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('adds to the last element of an allOf schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        b: {
          allOf: [{ $ref: '#/components/schemas/a' }],
          type: 'object',
          properties: { b: { type: 'string' } },
          required: ['b'],
          description: 'jello',
        },
      },
      required: ['b'],
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const object2 = object1.extend({ b: z.string() });
    const schema = z.object({
      b: object2.openapi({ description: 'jello' }),
    });

    const result = createSchemaWithMetadata(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
