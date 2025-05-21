import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('refine', () => {
  it('creates refine schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().refine((val) => val.length > 5);

    const result = createSchema(schema, createOutputState(), ['refine']);

    expect(result).toEqual(expected);
  });
});
