import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createOutputState } from '../../../testing/state';

import { createManualTypeSchema } from './manual';

extendZodWithOpenApi(z);

describe('createManualTypeSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
      },
    };
    const schema = z.unknown().openapi({ type: 'string' });

    const result = createManualTypeSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
