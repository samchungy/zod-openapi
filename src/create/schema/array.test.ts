import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createArraySchema } from './array';

extendZodWithOpenApi(z);

describe('createArraySchema', () => {
  it('creates simple arrays', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
    };
    const result = createArraySchema(z.array(z.string()));

    expect(result).toEqual(expected);
  });

  it('creates min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 10,
    };
    const result = createArraySchema(z.array(z.string()).min(0).max(10));

    expect(result).toEqual(expected);
  });

  it('creates exact length', () => {
    const expected: oas31.SchemaObject = {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 10,
      maxItems: 10,
    };
    const result = createArraySchema(z.array(z.string()).length(10));

    expect(result).toEqual(expected);
  });
});
