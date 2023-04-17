import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createInputState, createOutputState } from '../../test/state';

import { createPreprocessSchema } from './preprocess';

extendZodWithOpenApi(z);

describe('createPreprocessSchema', () => {
  describe('input', () => {
    it('throws an error when creating an input schema with preprocess', () => {
      const schema = z.preprocess(
        (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
        z.string(),
      );
      expect(() =>
        createPreprocessSchema(schema, createInputState()),
      ).toThrow();
    });

    it('returns a manually declared type when creating an input schema with preprocess', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z
        .preprocess(
          (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
          z.string(),
        )
        .openapi({ type: 'string' });

      const result = createPreprocessSchema(schema, createInputState());

      expect(result).toStrictEqual(expected);
    });
  });

  describe('output', () => {
    it('returns a schema when creating an output schema with preprocess', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z
        .preprocess(
          (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
          z.string(),
        )
        .openapi({ type: 'string' });

      const result = createPreprocessSchema(schema, createOutputState());

      expect(result).toStrictEqual(expected);
    });

    it('changes the state effectType to output', () => {
      const schema = z
        .preprocess(
          (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
          z.string(),
        )
        .openapi({ type: 'string' });

      const state = createOutputState();

      createPreprocessSchema(schema, state);

      expect(state.effectType).toBe('output');
    });
  });
});
