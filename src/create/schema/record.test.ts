import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../testing/state';

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
});
