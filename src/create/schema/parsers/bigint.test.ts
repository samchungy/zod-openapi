import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';

import { createBigIntSchema } from './bigint';

describe('createBigIntSchema', () => {
  it('creates a int64 schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'integer',
        format: 'int64',
      },
    };
    const schema = z.bigint();

    const result = createBigIntSchema(schema);

    expect(result).toEqual(expected);
  });
});
