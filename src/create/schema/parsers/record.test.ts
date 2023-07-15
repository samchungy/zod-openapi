import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

import { createRecordSchema } from './record';

extendZodWithOpenApi(z);

describe('createRecordSchema', () => {
  it('creates an object schema with additional properties in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };
    const schema = z.record(z.string());

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates an object schema with propertyNames in 3.1.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      // @ts-expect-error FIXME: https://github.com/metadevpro/openapi3-ts/pull/120
      propertyNames: {
        type: 'string',
        pattern: '^foo',
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const schema = z.record(z.string().regex(/^foo/), z.string());

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates an object schema with additional properties and key properties in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        a: { type: 'string' },
        b: { type: 'string' },
      },
      additionalProperties: false,
    };
    const schema = z.record(z.enum(['a', 'b']), z.string());

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });

  it('unwraps the a key schema in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        A: {
          type: 'string',
        },
        B: {
          type: 'string',
        },
      },
      additionalProperties: false,
    };
    const basicEnum = z.enum(['A', 'B']);
    const complexSchema = z
      .string()
      .trim()
      .length(1)
      .transform((val) => val.toUpperCase())
      .pipe(basicEnum);

    const schema = z.record(complexSchema, z.string());

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });

  it('supports registering the value schema in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        A: {
          $ref: '#/components/schemas/value',
        },
        B: {
          $ref: '#/components/schemas/value',
        },
      },
      additionalProperties: false,
    };
    const basicEnum = z.enum(['A', 'B']);
    const complexSchema = z
      .string()
      .trim()
      .length(1)
      .transform((val) => val.toUpperCase())
      .pipe(basicEnum);

    const schema = z.record(
      complexSchema,
      z.string().openapi({ ref: 'value' }),
    );

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });

  it('supports registering key enum schemas in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        A: {
          type: 'string',
        },
        B: {
          type: 'string',
        },
      },
      additionalProperties: false,
    };
    const basicEnum = z.enum(['A', 'B']);
    const complexSchema = z
      .string()
      .trim()
      .length(1)
      .transform((val) => val.toUpperCase())
      .pipe(basicEnum)
      .openapi({ ref: 'key' });

    const schema = z.record(complexSchema, z.string());

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });

  it('supports registering key schemas in 3.1.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      // @ts-expect-error FIXME: https://github.com/metadevpro/openapi3-ts/pull/120
      propertyNames: {
        $ref: '#/components/schemas/key',
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const complexSchema = z.string().regex(/^foo/).openapi({ ref: 'key' });

    const schema = z.record(complexSchema, z.string());

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
