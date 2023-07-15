import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createOutputState } from '../../testing/state';

import { createRefineSchema } from './refine';

extendZodWithOpenApi(z);

describe('createRefineSchema', () => {
  it('returns a schema when creating an output schema with preprocess', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().refine((check) => typeof check === 'string');

    const result = createRefineSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
