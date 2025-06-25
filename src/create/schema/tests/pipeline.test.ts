import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';
import { createInputContext, createOutputContext } from '../../../testing/ctx';

describe('pipeline', () => {
  describe('input', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());

      const ctx = createInputContext();
      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
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

      const ctx = createOutputContext();
      ctx.io = 'input' as any;
      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'string',
        },
        components: {},
      });
    });

    it('overrides the input type from a transform pipeline with a custom effectType', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number())
        .openapi({ effectType: 'output' });

      const expected: oas31.SchemaObject = {
        type: 'number',
      };

      const result = createSchema(schema, createInputState(), ['pipeline']);

      expect(result).toEqual(expected);
    });

    it('renders the input schema if the effectType is same', () => {
      const schema = z
        .string()
        .pipe(z.string())
        .openapi({ effectType: 'same' });

      const state = createInputState();
      const exepctedResult: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, state, ['pipeline']);
      expect(result).toEqual(exepctedResult);
    });
  });

  describe('output', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const result = createSchema(schema, createOutputState(), ['pipeline']);

      expect(result).toEqual(expected);
    });

    it('creates a schema from a transform pipeline', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());
      const expected: oas31.SchemaObject = {
        type: 'number',
      };

      const result = createSchema(schema, createOutputState(), ['pipeline']);

      expect(result).toEqual(expected);
    });

    it('overrides the input type from a transform pipeline with a custom effectType', () => {
      const schema = z
        .string()
        .pipe(z.number())
        .openapi({ effectType: 'input' });
      const expected: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, createOutputState(), ['pipeline']);

      expect(result).toEqual(expected);
    });

    it('renders the input schema if the effectType is same', () => {
      const schema = z
        .string()
        .pipe(z.string())
        .openapi({ effectType: 'same' });

      const state = createOutputState();
      const exepctedResult: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, state, ['pipeline']);
      expect(result).toEqual(exepctedResult);
    });
  });
});
