import * as z from 'zod/v4';

import { createInputContext } from '../../../testing/ctx';
import { type SchemaResult, createSchema } from '../schema';

describe('pipeline', () => {
  describe('input', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());

      const ctx = createInputContext();
      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'string',
        },
        components: {},
      });
    });

    it('creates a schema from a transform pipeline', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const ctx = createInputContext();
      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'string',
        },
        components: {},
      });
    });
  });

  describe('output', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());

      const result = createSchema(schema);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'string',
        },
        components: {},
      });
    });

    it('creates a schema from a transform pipeline', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const result = createSchema(schema);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'number',
        },
        components: {},
      });
    });

    it('creates a schema from a overwrite', () => {
      const schema = z.string().overwrite(() => 'foo');

      const result = createSchema(schema);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'string',
        },
        components: {},
      });
    });
  });
});
