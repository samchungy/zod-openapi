import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('set', () => {
  it('creates set schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    };
    const schema = z.set(z.string());

    const result = createSchema(schema, createOutputState(), ['set']);

    expect(result).toEqual(expected);
  });
});
