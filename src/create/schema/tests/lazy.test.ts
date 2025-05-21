import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('lazy', () => {
  it('creates lazy schema', () => {
    type Category = {
      name: string;
      subcategories: Category[];
    };
    const expected: oas31.SchemaObject = {
      type: 'object',
      required: ['name', 'subcategories'],
      properties: {
        name: { type: 'string' },
        subcategories: {
          type: 'array',
          items: { $ref: '#/components/schemas/lazy' },
        },
      },
    };

    const categorySchema: z.ZodType<Category> = z.lazy(() =>
      z.object({
        name: z.string(),
        subcategories: z.array(categorySchema),
      }),
    );

    const schema = categorySchema.openapi({ id: 'lazy' });
    const result = createSchema(schema, createOutputState(), ['lazy']);

    expect(result).toEqual(expected);
  });
});
