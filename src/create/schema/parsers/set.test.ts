import '../../../extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createSetSchema } from './set';

describe('createSetSchema', () => {
  it('creates simple arrays', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        uniqueItems: true,
      },
    };
    const schema = z.set(z.string());

    const result = createSetSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates min and max', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'string',
        },
        minItems: 0,
        maxItems: 10,
      },
    };
    const schema = z.set(z.string()).min(0).max(10);

    const result = createSetSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
