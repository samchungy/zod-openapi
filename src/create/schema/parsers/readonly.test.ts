import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

import { createReadonlySchema } from './readonly';

extendZodWithOpenApi(z);

describe('createReadonlySchema', () => {
  it('creates a simple string schema for a readonly string', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().readonly();

    const result = createReadonlySchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
