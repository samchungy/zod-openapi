import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

import { createEffectsSchema } from './effects';

extendZodWithOpenApi(z);

describe('createEffectsSchema', () => {
  it('creates a schema from preprocess', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.preprocess((arg) => String(arg), z.string());

    const result = createEffectsSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });

  it('creates a schema from refine', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().refine((str) => {
      str.startsWith('bla');
    });

    const result = createEffectsSchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });
});
