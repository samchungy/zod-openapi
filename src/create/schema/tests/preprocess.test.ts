import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';

describe('preprocess', () => {
  it('returns a schema with preprocess', () => {
    const schema = z.preprocess(
      (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
      z.string(),
    );

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'string',
      },
      components: {},
    });
  });
});
