import { type ZodString, z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createStringSchema } from './string';

extendZodWithOpenApi(z);

describe('createStringSchema', () => {
  it('creates a simple string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string();

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with a regex pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const schema = z.string().regex(/^hello/);

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with a startsWith pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const schema = z.string().startsWith('hello');

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an endsWith pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: 'hello$',
    };
    const schema = z.string().endsWith('hello');

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an includes pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: 'hello',
    };
    const schema = z.string().includes('hello');

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an includes starting at index pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^.{5}hello',
    };
    const schema = z.string().includes('hello', { position: 5 });

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an includes starting at index 0', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const schema = z.string().includes('hello', { position: 0 });

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with multiple patterns and length checks', () => {
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          type: 'string',
          pattern: '^foo',
          minLength: 10,
        },
        {
          type: 'string',
          pattern: 'foo$',
        },
        {
          type: 'string',
          pattern: '^hello',
        },
        {
          type: 'string',
          pattern: 'hello',
        },
      ],
    };
    const schema = z
      .string()
      .min(10)
      .includes('hello')
      .startsWith('hello')
      .regex(/^foo/)
      .regex(/foo$/);

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 0,
      maxLength: 1,
    };
    const schema = z.string().min(0).max(1);

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with nonempty', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 1,
    };
    const schema = z.string().nonempty();

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with a set length', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 1,
      maxLength: 1,
    };
    const schema = z.string().length(1);

    const result = createStringSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it.each`
    zodString                | format
    ${z.string().uuid()}     | ${'uuid'}
    ${z.string().email()}    | ${'email'}
    ${z.string().url()}      | ${'uri'}
    ${z.string().datetime()} | ${'date-time'}
  `(
    'creates a string schema with $format',
    ({ zodString, format }: { zodString: ZodString; format: string }) => {
      const expected: oas31.SchemaObject = {
        type: 'string',
        format,
      };
      const result = createStringSchema(zodString);
      expect(result).toStrictEqual(expected);
    },
  );
});
