import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

import { createOptionalSchema } from './optional';

extendZodWithOpenApi(z);

describe('createOptionalSchema', () => {
  it('creates a simple string schema for an optional string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().optional();

    const result = createOptionalSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });
});
