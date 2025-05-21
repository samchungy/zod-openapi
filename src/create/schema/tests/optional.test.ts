import '../../../entries/extend';
import { z } from 'zod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createSchema } from '..';
import { createOutputState } from '../../../testing/state';

describe('optional', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().optional();

    const result = createSchema(schema, createOutputState(), ['optional']);

    expect(result).toEqual(expected);
  });
});
