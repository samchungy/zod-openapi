import '../../../entries/extend';
import { z } from 'zod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createSchema } from '..';
import { createOutputState } from '../../../testing/state';

describe('preprocess', () => {
  it('returns a schema with preprocess', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.preprocess(
      (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
      z.string(),
    );

    const result = createSchema(schema, createOutputState(), ['preprocess']);

    expect(result).toEqual(expected);
  });
});
