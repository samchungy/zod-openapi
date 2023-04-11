import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createEffectsSchema } from './effects';

extendZodWithOpenApi(z);

describe('createEffectsSchema', () => {
  it('creates a schema from preprocess', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const result = createEffectsSchema(
      z.preprocess((arg) => String(arg), z.string()),
    );

    expect(result).toEqual(expected);
  });

  it('creates a schema from refine', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const result = createEffectsSchema(
      z.string().refine((str) => {
        str.startsWith('bla');
      }),
    );

    expect(result).toEqual(expected);
  });
});
