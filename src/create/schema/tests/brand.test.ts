import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('brand', () => {
  it('creates branded schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().brand<'email'>();

    const result = createSchema(schema, createOutputState(), ['brand']);

    expect(result).toEqual(expected);
  });
});
