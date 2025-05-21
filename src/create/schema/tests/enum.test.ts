import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('enum', () => {
  it('creates a string enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['a', 'b'],
    };
    
    const schema = z.enum(['a', 'b']);

    const result = createSchema(schema, createOutputState(), ['enum']);

    expect(result).toEqual(expected);
  });
});
