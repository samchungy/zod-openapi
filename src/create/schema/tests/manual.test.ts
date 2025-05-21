import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('manual', () => {
  it('creates manual schema override', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };
    const schema = z.string().openapi({ type: 'number' });

    const result = createSchema(schema, createOutputState(), ['manual']);

    expect(result).toEqual(expected);
  });
});
