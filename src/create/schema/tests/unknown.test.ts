import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('unknown', () => {
  it('creates unknown schema', () => {
    const expected: oas31.SchemaObject = {};
    const schema = z.unknown();

    const result = createSchema(schema, createOutputState(), ['unknown']);

    expect(result).toEqual(expected);
  });
});
