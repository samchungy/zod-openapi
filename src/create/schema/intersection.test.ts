import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createOutputState } from '../../test/state';

import { createIntersectionSchema } from './intersection';

extendZodWithOpenApi(z);

describe('createIntersectionSchema', () => {
  it('creates an intersection schema', () => {
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z.intersection(z.string(), z.number());

    const result = createIntersectionSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
