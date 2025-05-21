import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('records', () => {
  it('creates record schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };
    const schema = z.record(z.string());

    const result = createSchema(schema, createOutputState(), ['record']);

    expect(result).toEqual(expected);
  });

  it('creates record schema with specific key type', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      propertyNames: {
        enum: ['a', 'b', 'c'],
      },
      additionalProperties: {
        type: 'number',
      },
    };
    const schema = z.record(z.enum(['a', 'b', 'c']), z.number());

    const result = createSchema(schema, createOutputState(), ['record']);

    expect(result).toEqual(expected);
  });
});
