import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

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

    const result = createRecordSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
