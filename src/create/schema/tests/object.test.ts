import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('objects', () => {
  it('creates object schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: ['name', 'age'],
    };
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    const result = createSchema(schema, createOutputState(), ['object']);

    expect(result).toEqual(expected);
  });

  it('creates object schema with optional properties', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'number',
        },
      },
      required: ['name'],
    };
    const schema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });

    const result = createSchema(schema, createOutputState(), ['object']);

    expect(result).toEqual(expected);
  });
});
