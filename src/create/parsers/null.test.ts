import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';

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
