import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createInputState, createOutputState } from '../../../testing/state';

import { createPipelineSchema } from './pipeline';

extendZodWithOpenApi(z);

describe('createPipelineSchema', () => {
  describe('input', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
        effect: {
          type: 'input',
          zodType: schema,
          path: [],
        },
      };

      const result = createPipelineSchema(schema, createInputState());

      expect(result).toEqual(expected);
    });

    it('creates a schema from a transform pipeline', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
        effect: {
          type: 'input',
          zodType: schema,
          path: [],
        },
      };

      const result = createPipelineSchema(schema, createInputState());

      expect(result).toEqual(expected);
    });

    it('overrides the input type from a transform pipeline with a custom effectType', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number())
        .openapi({ effectType: 'output' });

      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'number',
        },
      };

      const result = createPipelineSchema(schema, createInputState());

      expect(result).toEqual(expected);
    });
  });

  describe('output', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
        effect: {
          type: 'output',
          zodType: schema,
          path: [],
        },
      };
      const result = createPipelineSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('creates a schema from a transform pipeline', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'number',
        },
        effect: {
          type: 'output',
          zodType: schema,
          path: [],
        },
      };

      const result = createPipelineSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('overrides the input type from a transform pipeline with a custom effectType', () => {
      const schema = z
        .string()
        .pipe(z.number())
        .openapi({ effectType: 'input' });
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
      };

      const result = createPipelineSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });
  });
});
