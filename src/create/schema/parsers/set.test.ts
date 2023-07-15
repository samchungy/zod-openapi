import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

import { createSetSchema } from './set';

extendZodWithOpenApi(z);

describe('createSetSchema', () => {
  it('creates simple arrays', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    };
    const schema = z.set(z.string());

    const result = createSetSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      uniqueItems: true,
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 10,
    };
    const schema = z.set(z.string()).min(0).max(10);

    const result = createSetSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
