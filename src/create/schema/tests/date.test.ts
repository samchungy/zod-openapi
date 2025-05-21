import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('date', () => {
  it('creates date schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      format: 'date-time',
    };
    const schema = z.date();

    const result = createSchema(schema, createOutputState(), ['date']);

    expect(result).toEqual(expected);
  });
});
