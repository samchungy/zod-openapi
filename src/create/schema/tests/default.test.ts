import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('default', () => {
  it('creates a default string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      default: 'a',
    };

    const schema = z.string().default('a');

    const result = createSchema(schema, createOutputState(), ['default']);

    expect(result).toEqual(expected);
  });

  it('adds a default property to a registered schema', () => {
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          $ref: '#/components/schemas/ref',
        },
      ],
      default: 'a',
    };

    const schema = z.string().openapi({ ref: 'ref' }).optional().default('a');

    const result = createSchema(schema, createOutputState(), ['default']);

    expect(result).toEqual(expected);
  });
});
