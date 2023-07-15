import { z } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createBrandedSchema } from './brand';

describe('createBrandedSchema', () => {
  it('supports branded schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    };
    const result = createBrandedSchema(
      z.object({ name: z.string() }).brand<'Cat'>(),
      createOutputState(),
    );
    expect(result).toStrictEqual(expected);
  });
});
