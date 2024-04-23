import '../../../extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createInputState, createOutputState } from '../../../testing/state';

import { createPipelineSchema } from './pipeline';

describe('createPipelineSchema', () => {
  describe('input', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
        effects: [
          {
            type: 'schema',
            creationType: 'input',
            zodType: schema,
            path: [],
          },
        ],
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
        effects: [
          {
            type: 'schema',
            creationType: 'input',
            zodType: schema,
            path: [],
          },
          {
            type: 'schema',
            creationType: 'input',
            zodType: schema._def.in,
            path: ['pipeline input'],
          },
        ],
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

    it('renders the input schema if the effectType is same', () => {
      const schema = z
        .string()
        .pipe(z.string())
        .openapi({ effectType: 'same' });

      const state = createInputState();
      const exepctedResult: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
      };

      const result = createPipelineSchema(schema, state);
      expect(result).toEqual(exepctedResult);
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
        effects: [
          {
            type: 'schema',
            creationType: 'output',
            zodType: schema,
            path: [],
          },
        ],
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
        effects: [
          {
            type: 'schema',
            creationType: 'output',
            zodType: schema,
            path: [],
          },
        ],
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

    it('renders the input schema if the effectType is same', () => {
      const schema = z
        .string()
        .pipe(z.string())
        .openapi({ effectType: 'same' });

      const state = createOutputState();
      const exepctedResult: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
      };

      const result = createPipelineSchema(schema, state);
      expect(result).toEqual(exepctedResult);
    });
  });
});
