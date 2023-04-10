import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createUnionSchema } from './union';

extendZodWithOpenApi(z);

describe('createUnionSchema', () => {
  it('creates a oneOf schema for a union', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const result = createUnionSchema(z.union([z.string(), z.number()]));

    expect(result).toEqual(expected);
  });
});
