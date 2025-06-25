import { z } from 'zod/v4';

import { createSchema } from '../schema';

describe('manual', () => {
  it('creates a string schema for a string override', () => {
    const schema = z.unknown().meta({
      override: { type: 'string' },
    });

    const result = createSchema(schema);

    expect(result).toEqual({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });
});
