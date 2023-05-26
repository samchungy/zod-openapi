import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createManualTypeSchema } from './manual';

extendZodWithOpenApi(z);

describe('createManualTypeSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.unknown().openapi({ type: 'string' });

    const result = createManualTypeSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
