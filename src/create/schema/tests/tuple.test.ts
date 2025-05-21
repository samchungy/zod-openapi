import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('tuples', () => {
  it('creates tuple schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: false,
      prefixItems: [
        { type: 'string' },
        { type: 'number' },
      ],
      minItems: 2,
      maxItems: 2,
    };
    const schema = z.tuple([z.string(), z.number()]);

    const result = createSchema(schema, createOutputState(), ['tuple']);

    expect(result).toEqual(expected);
  });

  it('creates tuple schema with rest', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      prefixItems: [
        { type: 'string' },
        { type: 'number' },
      ],
      items: {
        type: 'boolean',
      },
      minItems: 2,
    };
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());

    const result = createSchema(schema, createOutputState(), ['tuple']);

    expect(result).toEqual(expected);
  });
});
