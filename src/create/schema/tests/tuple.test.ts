import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';

describe('tuple', () => {
  it('creates an array schema', () => {
    const schema = z.tuple([z.string(), z.number()]);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'array',
        prefixItems: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
      components: {},
    });
  });

  it('creates an array schema with additionalProperties', () => {
    const schema = z.tuple([z.string(), z.number()]).rest(z.boolean());

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'array',
        prefixItems: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
        items: {
          type: 'boolean',
        },
      },
      components: {},
    });
  });

  it('creates an empty array schema', () => {
    const schema = z.tuple([]);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'array',
        prefixItems: [],
      },
      components: {},
    });
  });
});
