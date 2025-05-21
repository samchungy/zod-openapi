import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('preprocess', () => {
  it('creates preprocess schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.preprocess((val) => String(val), z.string());

    const result = createSchema(schema, createOutputState(), ['preprocess']);

    expect(result).toEqual(expected);
  });
});
