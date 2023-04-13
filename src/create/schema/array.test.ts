import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

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

    const result = createArraySchema(schema, getDefaultComponents());

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

    const result = createArraySchema(schema, getDefaultComponents());

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

    const result = createArraySchema(schema, getDefaultComponents());

    expect(result).toStrictEqual(expected);
  });
});
