import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

import { createLiteralSchema } from './literal';

extendZodWithOpenApi(z);

describe('createLiteralSchema', () => {
  describe('OpenAPI 3.1.0', () => {
    it('creates a string const schema', () => {
      const state = createOutputState();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
          const: 'a',
        },
      };
      const schema = z.literal('a');

      const result = createLiteralSchema(schema, state);

      expect(result).toStrictEqual(expected);
    });

    it('creates a number const schema', () => {
      const state = createOutputState();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'number',
          const: 2,
        },
      };
      const schema = z.literal(2);

      const result = createLiteralSchema(schema, state);

      expect(result).toEqual(expected);
    });

    it('creates a boolean const schema', () => {
      const state = createOutputState();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'boolean',
          const: true,
        },
      };
      const schema = z.literal(true);

      const result = createLiteralSchema(schema, state);

      expect(result).toEqual(expected);
    });

    it('creates a null const schema', () => {
      const state = createOutputState();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'null',
        },
      };
      const schema = z.literal(null);

      const result = createLiteralSchema(schema, state);

      expect(result).toEqual(expected);
    });
  });

  describe('OpenAPI 3.0.0', () => {
    it('creates a string enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
          enum: ['a'],
        },
      };
      const schema = z.literal('a');

      const result = createLiteralSchema(schema, state);

      expect(result).toStrictEqual(expected);
    });

    it('creates a number enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'number',
          enum: [2],
        },
      };
      const schema = z.literal(2);

      const result = createLiteralSchema(schema, state);

      expect(result).toEqual(expected);
    });

    it('creates a boolean enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'boolean',
          enum: [true],
        },
      };
      const schema = z.literal(true);

      const result = createLiteralSchema(schema, state);

      expect(result).toEqual(expected);
    });

    it('creates a null enum schema', () => {
      const state = createOutputOpenapi3State();
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'null',
        },
      };
      const schema = z.literal(null);

      const result = createLiteralSchema(schema, state);

      expect(result).toEqual(expected);
    });
  });
});
