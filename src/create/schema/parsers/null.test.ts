import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';

import { createNullSchema } from './null';

extendZodWithOpenApi(z);

describe('createNullSchema', () => {
  it('creates a null schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'null',
      },
    };

    const result = createNullSchema();

    expect(result).toEqual(expected);
  });
});
