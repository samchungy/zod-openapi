import { z } from 'zod/v4';

import type { oas31 } from '../../../openapi3-ts/dist';
import { createInputContext } from '../../../testing/ctx';
import { type CreateSchemaResult, createSchema } from '../schema';

describe('transform', () => {
  describe('input', () => {
    it('creates a schema from transform', () => {
      const schema = z.string().transform((str) => str.length);

      const ctx = createInputContext();

      const result = createSchema(schema, ctx);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'string',
        },
        components: {},
      });
    });
  });

  describe('output', () => {
    it('throws an error with a schema with transform', () => {
      const schema = z.string().transform((str) => str.length);

      expect(() => createSchema(schema)).toThrow(
        'Zod transform schemas are not supported in output schemas. Please use `.overwrite()` or wrap the schema in a `.pipe()`',
      );
    });

    it('creates a schema with the manual type when a type is manually specified', () => {
      const schema = z
        .string()
        .transform((str) => str.length)
        .meta({ override: { type: 'number' } });

      const result = createSchema(schema);

      expect(result).toEqual<CreateSchemaResult>({
        schema: {
          type: 'number',
        } as oas31.SchemaObject,
        components: {},
      });
    });
  });
});
