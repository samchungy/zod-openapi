import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createInputState, createOutputState } from '../../../testing/state';

describe('transform', () => {
  describe('input', () => {
    it('creates a schema from transform', () => {
      const schema = z.string().transform((str) => str.length);
      const expected: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, createInputState(), ['transform']);

      expect(result).toStrictEqual(expected);
    });

    it('produces an effect which is of type input', () => {
      const schema = z.string().transform((str) => str.length);
      const state = createInputState();

      const expected: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, state, ['transform']);

      expect(result).toEqual(expected);
    });

    it('does not throw an error if the effectType is output and effectType is set in openapi', () => {
      const schema = z
        .string()
        .transform((str) => str.length)
        .openapi({ effectType: 'input' });

      const state = createInputState();

      createSchema(schema, state, ['transform']);
    });

    it('renders the input schema if the effectType is same', () => {
      const schema = z
        .string()
        .transform((str) => str)
        .openapi({ effectType: 'same' });

      const state = createInputState();
      const expectedResult: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, state, ['transform']);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('output', () => {
    it('throws an error with a schema with transform', () => {
      const schema = z.string().transform((str) => str.length);
      const state = createOutputState();
      state.path.push('somepath');

      expect(() =>
        createSchema(schema, state, ['transform']),
      ).toThrowErrorMatchingInlineSnapshot(
        `"Failed to determine a type for ZodEffects - transform at somepath > transform. Please change the 'effectType' to 'same' or 'input', wrap it in a ZodPipeline or assign it a manual 'type'."`,
      );
    });

    it('creates a schema with the manual type when a type is manually specified', () => {
      const expected: oas31.SchemaObject = {
        type: 'number',
      };
      const schema = z
        .string()
        .transform((str) => str.length)
        .openapi({ type: 'number' });

      const result = createSchema(schema, createOutputState(), ['transform']);

      expect(result).toEqual(expected);
    });

    it('returns a schema when creating a schema with transform when openapi effectType is set', () => {
      const schema = z
        .string()
        .transform((str) => str)
        .openapi({ effectType: 'input' });
      const expected: oas31.SchemaObject = {
        type: 'string',
      };
      const result = createSchema(schema, createOutputState(), ['transform']);

      expect(result).toEqual(expected);
    });

    it('renders the input schema if the effectType is same', () => {
      const schema = z
        .string()
        .transform((str) => str)
        .openapi({ effectType: 'same' });

      const state = createOutputState();
      const expectedResult: oas31.SchemaObject = {
        type: 'string',
      };

      const result = createSchema(schema, state, ['transform']);
      expect(result).toEqual(expectedResult);
    });
  });
});
