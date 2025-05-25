import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('bigint', () => {
  it('creates a int64 schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
      format: 'int64',
    };
    const schema = z.bigint();

    const result = createSchema(schema, createOutputState(), ['bigint']);

    expect(result).toEqual(expected);
  });
});
