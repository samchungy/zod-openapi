import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createNullSchema } from './null';

extendZodWithOpenApi(z);

describe('createNullSchema', () => {
  it('creates a null schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'null',
    };
    const schema = z.null();

    const result = createNullSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
