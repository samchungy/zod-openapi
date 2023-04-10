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
    const result = createStringSchema(z.string());

    expect(result).toEqual(expected);
  });

  it('creates a string schema with a pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const result = createStringSchema(z.string().regex(/^hello/));

    expect(result).toEqual(expected);
  });

  it('creates a string schema with min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 0,
      maxLength: 1,
    };
    const result = createStringSchema(z.string().min(0).max(1));

    expect(result).toEqual(expected);
  });

  it('creates a string schema with nonempty', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 1,
    };
    const result = createStringSchema(z.string().nonempty());

    expect(result).toEqual(expected);
  });

  it('creates a string schema with a set length', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 1,
      maxLength: 1,
    };
    const result = createStringSchema(z.string().length(1));

    expect(result).toEqual(expected);
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
      expect(result).toEqual(expected);
    },
  );
});
