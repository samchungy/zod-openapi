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
    const result = createNullSchema(z.null());

    expect(result).toEqual(expected);
  });
});
