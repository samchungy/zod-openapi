import { type ZodString, z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

describe('string', () => {
  it('creates a simple string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };

    const schema = z.string();

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with a regex pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const schema = z.string().regex(/^hello/);

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with a startsWith pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello.*',
    };
    const schema = z.string().startsWith('hello');

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an endsWith pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '.*hello$',
    };
    const schema = z.string().endsWith('hello');

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an includes pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: 'hello',
    };
    const schema = z.string().includes('hello');

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an includes starting at index pattern', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^.{5}hello',
    };
    const schema = z.string().includes('hello', { position: 5 });

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with an includes starting at index 0', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^hello',
    };
    const schema = z.string().includes('hello', { position: 0 });

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with multiple patterns and length checks', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 10,
      allOf: [
        {
          pattern: 'hello',
        },
        {
          pattern: '^hello.*',
        },
        {
          pattern: '^foo',
        },
        {
          pattern: 'foo$',
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

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 0,
      maxLength: 1,
    };
    const schema = z.string().min(0).max(1);

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with nonempty', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 1,
    };

    const schema = z.string().nonempty();

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string schema with a set length', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 1,
      maxLength: 1,
    };
    const schema = z.string().length(1);

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a uri format string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      format: 'uri',
    };
    const schema = z.url();

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toStrictEqual(expected);
  });

  it.each`
    zodString           | format
    ${z.uuid()}         | ${'uuid'}
    ${z.email()}        | ${'email'}
    ${z.iso.datetime()} | ${'date-time'}
    ${z.iso.date()}     | ${'date'}
    ${z.iso.time()}     | ${'time'}
    ${z.iso.duration()} | ${'duration'}
    ${z.ipv4()}         | ${'ipv4'}
    ${z.ipv6()}         | ${'ipv6'}
    ${z.cidrv4()}       | ${'cidrv4'}
    ${z.cidrv6()}       | ${'cidrv6'}
  `(
    'creates a string schema with $format',
    ({ zodString, format }: { zodString: ZodString; format: string }) => {
      const expected: oas31.SchemaObject = {
        type: 'string',
        format,
        pattern: expect.any(String),
      };
      const result = createSchema(zodString, createOutputState(), ['string']);
      expect(result).toStrictEqual(expected);
    },
  );

  it('supports contentEncoding in 3.1.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      contentEncoding: 'base64',
      format: 'base64',
      pattern:
        '^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$',
    };

    const result = createSchema(z.string().base64(), createOutputState(), [
      'string',
    ]);

    expect(result).toStrictEqual(expected);
  });

  it('does not support contentEncoding in 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };

    const result = createSchema(z.base64(), createOutputOpenapi3State(), [
      'string',
    ]);

    expect(result).toStrictEqual(expected);
  });
});
