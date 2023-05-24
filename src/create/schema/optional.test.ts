import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createInputState, createOutputState } from '../../testing/state';

import { createOptionalSchema, isOptionalSchema } from './optional';

extendZodWithOpenApi(z);

describe('createOptionalSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().optional();

    const result = createOptionalSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});

describe('isOptionalSchema', () => {
  it('returns true for an optional string', () => {
    const schema = z.string().optional();

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for an optional transform', () => {
    const schema = z
      .string()
      .optional()
      .transform((str) => str?.length ?? 0);

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for a union with an optional', () => {
    const schema = z.union([z.string(), z.string().optional()]);

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for an intersection with an optional', () => {
    const schema = z.intersection(z.string(), z.string().optional());

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for a nullable with an optional', () => {
    const schema = z.string().optional().nullable();

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for an async transform with an optional', () => {
    const schema = z
      .string()
      .optional()
      // eslint-disable-next-line @typescript-eslint/require-await
      .transform(async () => 'x');

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for an output state on pipeline', () => {
    const schema = z
      .string()
      .transform((str) => str.length)
      .pipe(z.number().optional());

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toBe(true);
  });

  it('returns true for an input state on pipeline', () => {
    const schema = z
      .string()
      .optional()
      .transform((str) => str?.length ?? 0)
      .pipe(z.number());

    const result = isOptionalSchema(schema, createInputState());

    expect(result).toBe(true);
  });

  it('returns true for an optional zod lazy', () => {
    const schema = z.string().default('a');

    const result = isOptionalSchema(schema, createInputState());

    expect(result).toBe(true);
  });
});
