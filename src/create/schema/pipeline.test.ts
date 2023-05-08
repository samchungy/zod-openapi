import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createInputState, createOutputState } from '../../testing/state';

import { createPipelineSchema } from './pipeline';

extendZodWithOpenApi(z);

describe('createTransformSchema', () => {
  describe('input', () => {
    it('creates a schema from a simple pipeline', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z.string().pipe(z.string());

      const result = createPipelineSchema(schema, createInputState());

      expect(result).toStrictEqual(expected);
    });

    it('creates a schema from a transform pipeline', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const result = createPipelineSchema(schema, createInputState());

      expect(result).toStrictEqual(expected);
    });

    it('overrides the input type from a transform pipeline with a custom effectType', () => {
      const expected: oas31.SchemaObject = {
        type: 'number',
      };
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number())
        .openapi({ effectType: 'output' });

      const result = createPipelineSchema(schema, createInputState());

      expect(result).toStrictEqual(expected);
    });

    it('throws an error when the current state effectType is output', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const state = createInputState();
      state.effectType = 'output';
      expect(() => createPipelineSchema(schema, state)).toThrow(
        '{"_def":{"in":{"_def":{"schema":{"_def":{"checks":[],"typeName":"ZodString","coerce":false}},"typeName":"ZodEffects","effect":{"type":"transform"}}},"out":{"_def":{"checks":[],"typeName":"ZodNumber","coerce":false}},"typeName":"ZodPipeline"}} contains a transform but is used in both an input and an output. This is likely a mistake. Set an `effectType` to resolve',
      );
    });
  });

  describe('output', () => {
    it('creates a schema from a simple pipeline', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z.string().pipe(z.string());

      const result = createPipelineSchema(schema, createOutputState());

      expect(result).toStrictEqual(expected);
    });

    it('creates a schema from a transform pipeline', () => {
      const expected: oas31.SchemaObject = {
        type: 'number',
      };
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const result = createPipelineSchema(schema, createOutputState());

      expect(result).toStrictEqual(expected);
    });

    it('overrides the input type from a transform pipeline with a custom effectType', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z
        .string()
        .pipe(z.number())
        .openapi({ effectType: 'input' });

      const result = createPipelineSchema(schema, createOutputState());

      expect(result).toStrictEqual(expected);
    });

    it('throws an error when the current state effectType is input', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const state = createOutputState();
      state.effectType = 'input';
      expect(() => createPipelineSchema(schema, state)).toThrow(
        '{"_def":{"in":{"_def":{"schema":{"_def":{"checks":[],"typeName":"ZodString","coerce":false}},"typeName":"ZodEffects","effect":{"type":"transform"}}},"out":{"_def":{"checks":[],"typeName":"ZodNumber","coerce":false}},"typeName":"ZodPipeline"}} contains a transform but is used in both an input and an output. This is likely a mistake. Set an `effectType` to resolve',
      );
    });
  });
});
