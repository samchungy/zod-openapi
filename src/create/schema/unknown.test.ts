import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createUnknownSchema } from './unknown';

extendZodWithOpenApi(z);

describe('createUnknownSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.unknown().openapi({ type: 'string' });

    const result = createUnknownSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
