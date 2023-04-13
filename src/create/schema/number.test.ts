import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createNumberSchema } from './number';

extendZodWithOpenApi(z);

describe('createNumberSchema', () => {
  it('creates a simple number schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };
    const schema = z.number();

    const result = createNumberSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a integer schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
    };
    const schema = z.number().int();

    const result = createNumberSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lt or gt', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      maximum: 10,
    };
    const schema = z.number().lt(10).gt(0);

    const result = createNumberSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lte or gte', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: 0,
      maximum: 10,
      exclusiveMaximum: 10,
    };
    const schema = z.number().lte(10).gte(0);

    const result = createNumberSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
