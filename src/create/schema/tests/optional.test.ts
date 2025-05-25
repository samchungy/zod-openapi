import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
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
