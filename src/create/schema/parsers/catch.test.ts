import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

import { createCatchSchema } from './catch';

extendZodWithOpenApi(z);

describe('createCatchSchema', () => {
  it('creates a simple string schema for a string with a catch', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().catch('bob');

    const result = createCatchSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
