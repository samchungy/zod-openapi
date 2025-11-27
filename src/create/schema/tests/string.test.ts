import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';
import type { ZodString } from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('string', () => {
  it('creates a simple string schema', () => {
    const schema = z.string();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });

  it('creates a string schema with a regex pattern', () => {
    const schema = z.string().regex(/^hello/);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        pattern: '^hello',
      },
      components: {},
    });
  });

  it('creates a string schema with a startsWith pattern', () => {
    const schema = z.string().startsWith('hello');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        pattern: '^hello.*',
      },
      components: {},
    });
  });

  it('creates a string schema with an endsWith pattern', () => {
    const schema = z.string().endsWith('hello');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        pattern: '.*hello$',
      },
      components: {},
    });
  });

  it('creates a string schema with an includes pattern', () => {
    const schema = z.string().includes('hello');

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        pattern: 'hello',
      },
      components: {},
    });
  });

  it('creates a string schema with an includes starting at index pattern', () => {
    const schema = z.string().includes('hello', { position: 5 });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        pattern: '^.{5}hello',
      },
      components: {},
    });
  });

  it('creates a string schema with an includes starting at index 0', () => {
    const schema = z.string().includes('hello', { position: 0 });

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        pattern: '^.{0}hello',
      },
      components: {},
    });
  });

  it('creates a string schema with multiple patterns and length checks', () => {
    const schema = z
      .string()
      .min(10)
      .includes('hello')
      .startsWith('hello')
      .regex(/^foo/)
      .regex(/foo$/);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
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
      },
      components: {},
    });
  });

  it('creates a string schema with min and max', () => {
    const schema = z.string().min(0).max(1);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        minLength: 0,
        maxLength: 1,
      },
      components: {},
    });
  });

  it('creates a string schema with nonempty', () => {
    const schema = z.string().nonempty();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        minLength: 1,
      },
      components: {},
    });
  });

  it('creates a string schema with a set length', () => {
    const schema = z.string().length(1);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        minLength: 1,
        maxLength: 1,
      },
      components: {},
    });
  });

  it('creates a uri format string schema', () => {
    const schema = z.url();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        format: 'uri',
      },
      components: {},
    });
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
      const result = createSchema(zodString);

      expect(result).toEqual<SchemaResult>(
        expect.objectContaining({
          schema: expect.objectContaining({
            type: 'string',
            format,
            pattern: expect.any(String),
          }),
          components: {},
        }),
      );
    },
  );

  it('supports contentEncoding', () => {
    const schema = z.base64();

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        contentEncoding: 'base64',
        type: 'string',
        format: 'base64',
        pattern:
          '^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$',
      },
      components: {},
    });
  });
});
