import 'zod-openapi/extend';
import { z } from 'zod';

import { type SchemaResult, createSchema } from './single';

describe('createSchema', () => {
  it('should create a schema', () => {
    const schema = createSchema(z.string().openapi({ description: 'foo' }));

    expect(schema).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        description: 'foo',
      },
    });
  });

  it('should create components', () => {
    const schema = createSchema(
      z.object({
        foo: z.string().openapi({ description: 'foo', ref: 'foo' }),
      }),
    );

    expect(schema).toEqual<SchemaResult>({
      schema: {
        type: 'object',
        properties: {
          foo: {
            $ref: '#/components/schemas/foo',
          },
        },
        required: ['foo'],
      },
      components: {
        foo: {
          type: 'string',
          description: 'foo',
        },
      },
    });
  });
});
