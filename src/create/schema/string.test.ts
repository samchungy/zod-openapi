import { oas31 } from 'openapi3-ts';
import { ZodString, z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

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

  it('creates a string schema with a pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const schema = z.string().regex(/^hello/);

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
