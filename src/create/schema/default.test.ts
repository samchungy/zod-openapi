import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

import { createDefaultSchema } from './default';

extendZodWithOpenApi(z);

describe('createDefaultSchema', () => {
  it('creates a default string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      default: 'a',
    };
    const schema = z.string().default('a');

    const result = createDefaultSchema(schema, getDefaultComponents());

    expect(result).toEqual(expected);
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

    const result = createDefaultSchema(schema, getDefaultComponents());

    expect(result).toEqual(expected);
  });
});
