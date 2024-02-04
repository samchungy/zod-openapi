import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createInputState, createOutputState } from '../../../testing/state';

import { createTransformSchema, throwTransformError } from './transform';

extendZodWithOpenApi(z);

describe('createTransformSchema', () => {
  describe('input', () => {
    it('creates a schema from transform', () => {
      const schema = z.string().transform((str) => str.length);
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

      const result = createTransformSchema(schema, createInputState());

      expect(result).toStrictEqual(expected);
    });

    it('produces an effect which is of type input', () => {
      const schema = z.string().transform((str) => str.length);
      const state = createInputState();

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

      const result = createTransformSchema(schema, state);

      expect(result).toEqual(expected);
    });

    it('does not throw an error if the effectType is output and effectType is set in openapi', () => {
      const schema = z
        .string()
        .transform((str) => str.length)
        .openapi({ effectType: 'input' });

      const state = {
        ...createInputState(),
        effectType: 'output',
      };

      createTransformSchema(schema, state);
    });
  });

  describe('output', () => {
    it('throws an error with a schema with transform', () => {
      const schema = z.string().transform((str) => str.length);
      const state = createOutputState();
      state.path.push('somepath');

      expect(() => createTransformSchema(schema, state)).toThrow(
        "Failed to determine a type for ZodEffects - transform at somepath. Please change the 'effectType' to 'input', wrap it in a ZodPipeline or assign it a manual 'type'.",
      );
    });

    it('creates a schema with the manual type when a type is manually specified', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'number',
        },
      };
      const schema = z
        .string()
        .transform((str) => str.length)
        .openapi({ type: 'number' });

      const result = createTransformSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('returns a schema when creating a schema with transform when openapi effectType is set', () => {
      const schema = z
        .string()
        .transform((str) => str)
        .openapi({ effectType: 'input' });
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: 'string',
        },
      };
      const result = createTransformSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('does not change the state effectType when openapi effectType is set', () => {
      const schema = z
        .string()
        .transform((str) => str.length)
        .openapi({ effectType: 'input' });

      const state = createOutputState();

      const result = createTransformSchema(schema, state);

      expect(result.effect?.type).toBeUndefined();
    });
  });
});

describe('throwTransformError', () => {
  it('throws an transform error', () => {
    expect(() =>
      throwTransformError(z.string().openapi({ description: 'a' }), [
        'previous',
        'path',
      ]),
    ).toThrow(
      '{"_def":{"checks":[],"typeName":"ZodString","coerce":false,"openapi":{"description":"a"}}} at previous > path is used within a registered compoment schema and contains a transformation but is used in both an input schema and output schema. This may cause the schema to render incorrectly and is most likely a mistake. Set an `effectType`, wrap it in a ZodPipeline or assign it a manual type to resolve the issue.',
    );
  });
});
