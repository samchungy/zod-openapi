import { z } from 'zod';

import type { Schema } from '..';
import { extendZodWithOpenApi } from '../../../extendZod';
import { createOutputState } from '../../../testing/state';

import { createUnionSchema } from './union';

extendZodWithOpenApi(z);

describe('createUnionSchema', () => {
  it('creates an anyOf schema for a union', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        anyOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
    };
    const schema = z.union([z.string(), z.number()]);

    const result = createUnionSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates an oneOf schema for a union if unionOneOf is true', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
    };
    const schema = z
      .union([z.string(), z.number()])
      .openapi({ unionOneOf: true });

    const result = createUnionSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
