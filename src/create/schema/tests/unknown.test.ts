import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';

describe('unknown', () => {
  it('should create an empty schema for unknown', () => {
    const schema = z.unknown();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {},
      components: {},
    });
  });

  it('should create an empty schema for any', () => {
    const schema = z.any();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {},
      components: {},
    });
  });
});
