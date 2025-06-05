import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('catch', () => {
  it('creates a default string schema for a string with a catch', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      default: 'bob',
    };

    const schema = z.string().catch('bob');

    const result = createSchema(schema, createOutputState(), ['catch']);

    expect(result).toEqual(expected);
  });
});
