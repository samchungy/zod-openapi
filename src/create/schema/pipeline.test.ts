import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
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
  });
});
