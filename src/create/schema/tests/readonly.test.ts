import '../../../entries/extend';
import { z } from 'zod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createSchema } from '..';
import { createOutputState } from '../../../testing/state';

describe('readonly', () => {
  it('creates a simple string schema for a readonly string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().readonly();

    const result = createSchema(schema, createOutputState(), ['readonly']);

    expect(result).toEqual(expected);
  });
});
