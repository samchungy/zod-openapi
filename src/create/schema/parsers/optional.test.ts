import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createInputState, createOutputState } from '../../../testing/state';

import { createOptionalSchema, isOptionalSchema } from './optional';

describe('createOptionalSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.string().optional();

    const result = createOptionalSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});

describe('isOptionalSchema', () => {
  it('returns true for an optional string', () => {
    const schema = z.string().optional();

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for an optional transform', () => {
    const schema = z
      .string()
      .optional()
      .transform((str) => str?.length ?? 0);

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for a union with an optional', () => {
    const schema = z.union([z.string(), z.string().optional()]);

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for an intersection with an optional', () => {
    const schema = z.intersection(z.string(), z.string().optional());

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for a nullable with an optional', () => {
    const schema = z.string().optional().nullable();

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for an async transform with an optional', () => {
    const schema = z
      .string()
      .optional()
      // eslint-disable-next-line @typescript-eslint/require-await
      .transform(async () => 'x');

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns false for an async transform without an optional', () => {
    const schema = z
      .string()
      // eslint-disable-next-line @typescript-eslint/require-await
      .transform(async () => 'x');

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: false });
  });

  it('returns false for a custom without an optional', () => {
    const schema = z.custom<Date>((d) => d instanceof Date);
    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: false });
  });

  it('returns true for a custom with an optional', () => {
    const schema = z.custom<Date>((d) => d instanceof Date).optional();
    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns false for a custom without an optional with async transform', () => {
    const schema = z
      .custom<Date>((d) => d instanceof Date)
      // eslint-disable-next-line @typescript-eslint/require-await
      .transform(async () => 'x');
    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: false });
  });

  it('returns true for a custom with an optional', () => {
    const schema = z
      .custom<Date>((d) => d instanceof Date)
      .optional()
      // eslint-disable-next-line @typescript-eslint/require-await
      .transform(async () => 'x');
    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for an output state on pipeline', () => {
    const schema = z
      .string()
      .transform((str) => str.length)
      .pipe(z.number().optional());

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for an input state on pipeline', () => {
    const schema = z
      .string()
      .optional()
      .transform((str) => str?.length ?? 0)
      .pipe(z.number());

    const result = isOptionalSchema(schema, createInputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for a zod default', () => {
    const schema = z.string().default('a');

    const result = isOptionalSchema(schema, createInputState());

    expect(result).toEqual({
      optional: true,
      effects: [
        {
          type: 'schema',
          creationType: 'input',
          zodType: schema,
          path: [],
        },
      ],
    });
  });

  it('returns true for a zod default in output state with effectType input', () => {
    const schema = z.string().default('a').openapi({ effectType: 'input' });

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({
      optional: true,
    });
  });

  it('returns false for a zod default in input state with effectType output', () => {
    const schema = z.string().default('a').openapi({ effectType: 'output' });

    const result = isOptionalSchema(schema, createInputState());

    expect(result).toEqual({
      optional: false,
    });
  });

  it('returns true for an input effectType on an output state pipeline', () => {
    const schema = z
      .string()
      .optional()
      .transform((str) => str?.length ?? 0)
      .pipe(z.number())
      .openapi({ effectType: 'input' });

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns false for an output effectType on an input state pipeline', () => {
    const schema = z
      .string()
      .optional()
      .transform((str) => str?.length ?? 0)
      .pipe(z.number())
      .openapi({ effectType: 'output' });

    const result = isOptionalSchema(schema, createInputState());

    expect(result).toEqual({ optional: false });
  });

  it('returns true for zod undefined', () => {
    const schema = z.undefined();

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for zod never', () => {
    const schema = z.never();

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });

  it('returns true for zod literal undefined', () => {
    const schema = z.literal(undefined);

    const result = isOptionalSchema(schema, createOutputState());

    expect(result).toEqual({ optional: true });
  });
});
