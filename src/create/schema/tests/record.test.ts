import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

describe('record', () => {
  it('creates an object schema with additional properties in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };
    const schema = z.record(z.string(), z.string());

    const result = createSchema(schema, createOutputState(), ['record']);

    expect(result).toEqual(expected);
  });

  it('creates an object schema with propertyNames in 3.1.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      propertyNames: {
        format: 'regex',
        type: 'string',
        pattern: '^foo',
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const schema = z.record(z.string().regex(/^foo/), z.string());

    const result = createSchema(schema, createOutputState(), ['record']);

    expect(result).toEqual(expected);
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

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'record',
    ]);

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

    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        A: { type: 'string' },
        B: { type: 'string' },
      },
      additionalProperties: false,
    };

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'record',
    ]);

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

    const schema = z.record(complexSchema, z.string().meta({ id: 'value' }));

    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        A: { $ref: '#/components/schemas/value' },
        B: { $ref: '#/components/schemas/value' },
      },
      additionalProperties: false,
    };

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'record',
    ]);

    expect(result).toEqual(expected);
  });

  it('supports registering key enum schemas in 3.0.0', () => {
    const basicEnum = z.enum(['A', 'B']);
    const complexSchema = z
      .string()
      .trim()
      .length(1)
      .transform((val) => val.toUpperCase())
      .pipe(basicEnum)
      .meta({ id: 'key' });

    const schema = z.record(complexSchema, z.string());

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

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'record',
    ]);

    expect(result).toEqual(expected);
  });

  it('supports registering key schemas in 3.1.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      propertyNames: {
        $ref: '#/components/schemas/key',
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const complexSchema = z.string().regex(/^foo/).meta({ id: 'key' });

    const schema = z.record(complexSchema, z.string());

    const result = createSchema(schema, createOutputState(), ['record']);

    expect(result).toEqual(expected);
  });

  it('supports lazy key schemas in 3.1.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      propertyNames: {
        $ref: '#/components/schemas/key',
      },
      additionalProperties: {
        type: 'string',
      },
    };
    const complexSchema = z.string().regex(/^foo/).meta({ id: 'key' });

    const schema = z.record(complexSchema, z.string());

    const result = createSchema(schema, createOutputState(), ['record']);

    expect(result).toEqual(expected);
  });
});
