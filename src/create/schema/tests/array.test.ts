import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('array', () => {
  it('creates simple arrays', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
    };
    const schema = z.array(z.string());

    const result = createSchema(schema, createOutputState(), ['array']);

    expect(result).toEqual(expected);
  });

  it('creates min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 10,
    };

    const schema = z.array(z.string()).min(0).max(10);

    const result = createSchema(schema, createOutputState(), ['array']);

    expect(result).toEqual(expected);
  });

  it('creates exact length', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 10,
      maxItems: 10,
    };

    const schema = z.array(z.string()).length(10);

    const result = createSchema(schema, createOutputState(), ['array']);

    expect(result).toEqual(expected);
  });
});
