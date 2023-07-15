import { z } from 'zod';

import { extendZodWithOpenApi } from '../../../extendZod';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

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
    const schema = z.array(z.string());

    const result = createArraySchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
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
    const schema = z.array(z.string()).min(0).max(10);

    const result = createArraySchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
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
    const schema = z.array(z.string()).length(10);

    const result = createArraySchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });
});
