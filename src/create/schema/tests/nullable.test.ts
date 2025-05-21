import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('nullable', () => {
  it('creates nullable schema', () => {
    const expected: oas31.SchemaObject = {
      type: ['string', 'null'],
    };
    const schema = z.string().nullable();

    const result = createSchema(schema, createOutputState(), ['nullable']);

    expect(result).toEqual(expected);
  });

  it('creates nullable object schema', () => {
    const expected: oas31.SchemaObject = {
      type: ['object', 'null'],
      properties: {
        name: { type: 'string' },
      },
      required: ['name'],
    };
    const schema = z.object({
      name: z.string(),
    }).nullable();

    const result = createSchema(schema, createOutputState(), ['nullable']);

    expect(result).toEqual(expected);
  });
});
