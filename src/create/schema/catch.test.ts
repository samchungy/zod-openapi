import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createOutputState } from '../../test/state';

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
