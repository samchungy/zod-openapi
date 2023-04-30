import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createOptionalSchema } from './optional';

extendZodWithOpenApi(z);

describe('createOptionalSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().optional();

    const result = createOptionalSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
