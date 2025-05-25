import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('null', () => {
  it('creates a null schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'null',
    };

    const schema = z.null();

    const result = createSchema(schema, createOutputState(), ['null']);

    expect(result).toEqual(expected);
  });
});
