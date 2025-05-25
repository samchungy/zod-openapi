import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

describe('literal', () => {
  describe('OpenAPI 3.1.0', () => {
    it('creates a string const schema', () => {
      const state = createOutputState();
      const expected: oas31.SchemaObject = {
        type: 'string',
        const: 'a',
      };

      const schema = z.literal('a');

      const result = createSchema(schema, state, ['literal']);

      expect(result).toStrictEqual(expected);
    });

    it('creates a number const schema', () => {
      const state = createOutputState();
      const expected: oas31.SchemaObject = {
        type: 'number',
        const: 2,
      };

      const schema = z.literal(2);

      const result = createSchema(schema, state, ['literal']);

      expect(result).toEqual(expected);
    });

    it('creates a boolean const schema', () => {
      const state = createOutputState();
      const expected: oas31.SchemaObject = {
        type: 'boolean',
        const: true,
      };

      const schema = z.literal(true);

      const result = createSchema(schema, state, ['literal']);

      expect(result).toEqual(expected);
    });

    it('creates a null const schema', () => {
      const state = createOutputState();
      const expected: oas31.SchemaObject = {
        type: 'null',
      };

      const schema = z.literal(null);

      const result = createSchema(schema, state, ['literal']);

      expect(result).toEqual(expected);
    });
  });

  describe('OpenAPI 3.0.0', () => {
    it('creates a string enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: oas31.SchemaObject = {
        type: 'string',
        enum: ['a'],
      };

      const schema = z.literal('a');

      const result = createSchema(schema, state, ['literal']);

      expect(result).toStrictEqual(expected);
    });

    it('creates a number enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: oas31.SchemaObject = {
        type: 'number',
        enum: [2],
      };

      const schema = z.literal(2);

      const result = createSchema(schema, state, ['literal']);

      expect(result).toEqual(expected);
    });

    it('creates a boolean enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: oas31.SchemaObject = {
        type: 'boolean',
        enum: [true],
      };

      const schema = z.literal(true);

      const result = createSchema(schema, state, ['literal']);

      expect(result).toEqual(expected);
    });

    it('creates a null enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: oas31.SchemaObject = {
        type: 'null',
      };

      const schema = z.literal(null);

      const result = createSchema(schema, state, ['literal']);

      expect(result).toEqual(expected);
    });
  });
});
