import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';
import { createOutputContext } from '../../../testing/ctx';

describe('literal', () => {
  describe('OpenAPI 3.1.0', () => {
    it('creates a string const schema', () => {
      const schema = z.literal('a');

      const result = createSchema(schema);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'string',
          const: 'a',
        },
        components: {},
      });
    });

    it('creates a number const schema', () => {
      const schema = z.literal(2);

      const result = createSchema(schema);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'number',
          const: 2,
        },
        components: {},
      });
    });

    it('creates a boolean const schema', () => {
      const schema = z.literal(true);

      const result = createSchema(schema);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'boolean',
          const: true,
        },
        components: {},
      });
    });

    it('creates a null const schema', () => {
      const schema = z.literal(null);

      const result = createSchema(schema);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          const: null,
          type: 'null',
        },
        components: {},
      });
    });
  });

  describe('OpenAPI 3.0.0', () => {
    it('creates a string enum schema', () => {
      const ctx = createOutputContext();
      // Set the context for OpenAPI 3.0.0
      ctx.io = 'openapi3' as any;

      const schema = z.literal('a');

      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'string',
          const: 'a',
        },
        components: {},
      });
    });

    it('creates a number enum schema', () => {
      const ctx = createOutputContext();
      // Set the context for OpenAPI 3.0.0
      ctx.io = 'openapi3' as any;

      const schema = z.literal(2);

      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'number',
          const: 2,
        },
        components: {},
      });
    });

    it('creates a boolean enum schema', () => {
      const ctx = createOutputContext();
      // Set the context for OpenAPI 3.0.0
      ctx.io = 'openapi3' as any;

      const schema = z.literal(true);

      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'boolean',
          const: true,
        },
        components: {},
      });
    });

    it('creates a null enum schema', () => {
      const ctx = createOutputContext();
      // Set the context for OpenAPI 3.0.0
      ctx.io = 'openapi3' as any;

      const schema = z.literal(null);

      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          const: null,
          type: 'null',
        },
        components: {},
      });
    });
  });
});
