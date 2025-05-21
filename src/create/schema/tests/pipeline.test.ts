import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('pipeline', () => {
  it('creates pipeline schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      format: 'email',
    };
    const schema = z.string().email().pipe(z.string().email());

    const result = createSchema(schema, createOutputState(), ['pipeline']);

    expect(result).toEqual(expected);
  });
});
