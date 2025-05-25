import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('boolean', () => {
  it('creates a boolean schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'boolean',
    };
    const schema = z.boolean();

    const result = createSchema(schema, createOutputState(), ['boolean']);

    expect(result).toEqual(expected);
  });
});
