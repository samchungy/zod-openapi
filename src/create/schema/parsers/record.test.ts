import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

import { createRecordSchema } from './record';

extendZodWithOpenApi(z);

describe('createRecordSchema', () => {
  it('creates an object schema with additional properties in 3.0.0', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      },
    };
    const schema = z.record(z.string());

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates an object schema with propertyNames in 3.1.0', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        propertyNames: {
          type: 'string',
          pattern: '^foo',
        },
        additionalProperties: {
          type: 'string',
        },
      },
    };
    const schema = z.record(z.string().regex(/^foo/), z.string());

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates an object schema with additional properties and key properties in 3.0.0', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          a: { type: 'string' },
          b: { type: 'string' },
        },
        additionalProperties: false,
      },
    };
    const schema = z.record(z.enum(['a', 'b']), z.string());

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toEqual(expected);
  });

  it('unwraps the a key schema in 3.0.0', () => {
    const basicEnum = z.enum(['A', 'B']);
    const complexSchema = z
      .string()
      .trim()
      .length(1)
      .transform((val) => val.toUpperCase())
      .pipe(basicEnum);

    const schema = z.record(complexSchema, z.string());

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          A: { type: 'string' },
          B: { type: 'string' },
        },
        additionalProperties: false,
      },
      effect: {
        type: 'output',
        zodType: complexSchema,
        path: ['record key'],
      },
    };

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toEqual(expected);
  });

  it('supports registering the value schema in 3.0.0', () => {
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

    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          A: { $ref: '#/components/schemas/value' },
          B: { $ref: '#/components/schemas/value' },
        },
        additionalProperties: false,
      },
      effect: {
        type: 'output',
        zodType: complexSchema,
        path: ['record key'],
      },
    };

    const result = createRecordSchema(schema, createOutputOpenapi3State());

    expect(result).toEqual(expected);
  });

  it('supports registering key enum schemas in 3.0.0', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
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
      },
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

    expect(result).toEqual(expected);
  });

  it('supports registering key schemas in 3.1.0', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        propertyNames: {
          $ref: '#/components/schemas/key',
        },
        additionalProperties: {
          type: 'string',
        },
      },
    };
    const complexSchema = z.string().regex(/^foo/).openapi({ ref: 'key' });

    const schema = z.record(complexSchema, z.string());

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
