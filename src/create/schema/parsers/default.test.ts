import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createDefaultSchema } from './default';

describe('createDefaultSchema', () => {
  it('creates a default string schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        default: 'a',
      },
    };
    const schema = z.string().default('a');

    const result = createDefaultSchema(schema, createOutputState(), undefined);

    expect(result).toEqual(expected);
  });

  it('adds a default property to a registered schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        allOf: [
          {
            $ref: '#/components/schemas/ref',
          },
        ],
        default: 'a',
      },
    };
    const schema = z.string().openapi({ ref: 'ref' }).optional().default('a');

    const result = createDefaultSchema(schema, createOutputState(), undefined);

    expect(result).toEqual(expected);
  });
});
