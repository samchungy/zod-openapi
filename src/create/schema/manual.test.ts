import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { oas31 } from '../../openapi3-ts/dist';

import { createManualTypeSchema } from './manual';

extendZodWithOpenApi(z);

describe('createManualTypeSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.unknown().openapi({ type: 'string' });

    const result = createManualTypeSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
