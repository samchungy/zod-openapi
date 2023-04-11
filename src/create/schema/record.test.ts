import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

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
    const schema = z.record(z.string());

    const result = createRecordSchema(schema, getDefaultComponents());

    expect(result).toEqual(expected);
  });
});
