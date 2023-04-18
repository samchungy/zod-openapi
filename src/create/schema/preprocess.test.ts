import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createOutputState } from '../../testing/state';

import { createPreprocessSchema } from './preprocess';

extendZodWithOpenApi(z);

describe('createPreprocessSchema', () => {
  it('returns a schema with preprocess', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.preprocess(
      (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
      z.string(),
    );

    const result = createPreprocessSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
