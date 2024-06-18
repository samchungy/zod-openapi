import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createArraySchema } from './array';

describe('createArraySchema', () => {
  it('creates simple arrays', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    };
    const schema = z.array(z.string());

    const result = createArraySchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates min and max', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 0,
        maxItems: 10,
      },
    };

    const schema = z.array(z.string()).min(0).max(10);

    const result = createArraySchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates exact length', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'array',
        items: {
          type: 'string',
        },
        minItems: 10,
        maxItems: 10,
      },
    };

    const schema = z.array(z.string()).length(10);

    const result = createArraySchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });
});
