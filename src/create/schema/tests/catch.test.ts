import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('catch', () => {
  it('creates catch schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().catch('default');

    const result = createSchema(schema, createOutputState(), ['catch']);

    expect(result).toEqual(expected);
  });
});
