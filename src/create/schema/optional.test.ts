import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createOptionalSchema } from './optional';

extendZodWithOpenApi(z);

describe('createOptionalSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const result = createOptionalSchema(z.string().optional());

    expect(result).toEqual(expected);
  });
});
