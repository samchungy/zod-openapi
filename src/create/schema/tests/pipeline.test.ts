import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createInputState, createOutputState } from '../../../testing/state';

describe('pipeline', () => {
  describe('input', () => {
    it('creates a schema from a simple pipeline', () => {
      const schema = z.string().pipe(z.string());
      const expected: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, createInputState(), ['pipeline']);

      expect(result).toEqual(expected);
    });

    it('creates a schema from a transform pipeline', () => {
      const schema = z
        .string()
        .transform((arg) => arg.length)
        .pipe(z.number());

      const expected: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, createInputState(), ['pipeline']);

      expect(result).toEqual(expected);
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
