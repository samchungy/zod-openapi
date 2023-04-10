import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createRecordSchema } from './record';

extendZodWithOpenApi(z);

describe('createRecordSchema', () => {
  it('creates an object schema with additional properties', () => {
    const expected: oas31.SchemaObject = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };
    const result = createRecordSchema(z.record(z.string()));

    expect(result).toEqual(expected);
  });
});
