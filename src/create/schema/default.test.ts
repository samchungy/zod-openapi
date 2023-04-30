import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createDefaultSchema } from './default';

extendZodWithOpenApi(z);

describe('createDefaultSchema', () => {
  it('creates a default string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      default: 'a',
    };
    const schema = z.string().default('a');

    const result = createDefaultSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('adds a default property to a registered schema', () => {
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          $ref: '#/components/schemas/ref',
        },
        {
          default: 'a',
        },
      ],
    };
    const schema = z.string().openapi({ ref: 'ref' }).optional().default('a');

    const result = createDefaultSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
