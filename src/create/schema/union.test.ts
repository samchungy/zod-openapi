import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createOutputState } from '../../testing/state';

import { createUnionSchema } from './union';

extendZodWithOpenApi(z);

describe('createUnionSchema', () => {
  it('creates a anyOf schema for a union', () => {
    const expected: oas31.SchemaObject = {
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z.union([z.string(), z.number()]);

    const result = createUnionSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
