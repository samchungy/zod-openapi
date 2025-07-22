import * as z from 'zod/v4';

import { createInputContext } from '../../../testing/ctx.js';
import { type SchemaResult, createSchema } from '../schema.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

describe('transform', () => {
  describe('input', () => {
    it('creates a schema from transform', () => {
      const schema = z.string().transform((str) => str.length);

      const ctx = createInputContext();

      const result = createSchema(schema, ctx);

      expect(result).toEqual<SchemaResult>({
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
        'Zod transform found at properties > zodOpenApiCreateSchema are not supported in output schemas. Please use `.overwrite()` or wrap the schema in a `.pipe()` or assign it manual metadata with `.meta()`',
      );
    });

    it('creates a schema with the manual type when a type is manually specified', () => {
      const schema = z
        .string()
        .transform((str) => str.length)
        .meta({ override: { type: 'number' } });

      const result = createSchema(schema);

      expect(result).toEqual<SchemaResult>({
        schema: {
          type: 'number',
        } as oas31.SchemaObject,
        components: {},
      });
    });
  });
});
