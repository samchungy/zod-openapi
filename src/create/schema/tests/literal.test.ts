import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('literal', () => {
  it('creates literal schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['test'],
    };
    const schema = z.literal('test');

    const result = createSchema(schema, createOutputState(), ['literal']);

    expect(result).toEqual(expected);
  });

  it('creates number literal schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      enum: [42],
    };
    const schema = z.literal(42);

    const result = createSchema(schema, createOutputState(), ['literal']);

    expect(result).toEqual(expected);
  });
});
