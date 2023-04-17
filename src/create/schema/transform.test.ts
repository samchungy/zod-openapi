import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createInputState, createOutputState } from '../../test/state';

import { createTransformSchema } from './transform';

extendZodWithOpenApi(z);

describe('createTransformSchema', () => {
  describe('input', () => {
    it('creates a schema from transform', () => {
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const schema = z.string().transform((str) => str.length);

      const result = createTransformSchema(schema, createInputState());

      expect(result).toStrictEqual(expected);
    });

    it('changes the state effectType to input', () => {
      const schema = z.string().transform((str) => str.length);
      const state = createInputState();

      createTransformSchema(schema, state);

      expect(state.effectType).toBe('input');
    });
  });

  describe('output', () => {
    it('throws an error with a schema with transform', () => {
      const schema = z.string().transform((str) => str.length);

      expect(() =>
        createTransformSchema(schema, createOutputState()),
      ).toThrow();
    });

    it('creates an empty schema when a type is manually specified', () => {
      const expected: oas31.SchemaObject = {
        type: 'number',
      };
      const schema = z
        .string()
        .transform((str) => str.length)
        .openapi({ type: 'number' });

      const result = createTransformSchema(schema, createOutputState());

      expect(result).toStrictEqual(expected);
    });
  });
});
