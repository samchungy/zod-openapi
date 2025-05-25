import '../../../entries/extend';
import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('refine', () => {
  it('returns a schema when creating an output schema with preprocess', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().refine((check) => typeof check === 'string');

    const result = createSchema(schema, createOutputState(), ['refine']);

    expect(result).toEqual(expected);
  });
});
