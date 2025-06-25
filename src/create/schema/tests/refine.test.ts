import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';

describe('refine', () => {
  it('returns a schema when creating an output schema with preprocess', () => {
    const schema = z.string().refine((check) => typeof check === 'string');

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });
});
