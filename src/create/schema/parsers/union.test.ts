import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

import { createUnionSchema } from './union';

extendZodWithOpenApi(z);

describe('createUnionSchema', () => {
  it('creates an anyOf schema for a union', () => {
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

  it('creates an oneOf schema for a union if unionOneOf is true', () => {
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
    const schema = z
      .union([z.string(), z.number()])
      .openapi({ unionOneOf: true });

    const result = createUnionSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
