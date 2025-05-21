import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('bigint', () => {
  it('creates bigint schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
      format: 'int64',
    };
    const schema = z.bigint();

    const result = createSchema(schema, createOutputState(), ['bigint']);

    expect(result).toEqual(expected);
  });
});
