import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('readonly', () => {
  it('creates a simple string schema for a readonly string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      readOnly: true,
    };
    const schema = z.string().readonly();

    const result = createSchema(schema, createOutputState(), ['readonly']);

    expect(result).toEqual(expected);
  });
});
