import '../../../entries/extend';
import { z } from 'zod';
import type { oas31 } from '../../../openapi3-ts/dist';

import { createSchema } from '..';
import { createOutputState } from '../../../testing/state';

describe('set', () => {
  it('creates simple arrays', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    };
    const schema = z.set(z.string());

    const result = createSchema(schema, createOutputState(), ['set']);

    expect(result).toEqual(expected);
  });

  it('creates min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 10,
    };
    const schema = z.set(z.string()).min(0).max(10);

    const result = createSchema(schema, createOutputState(), ['set']);

    expect(result).toEqual(expected);
  });
});
