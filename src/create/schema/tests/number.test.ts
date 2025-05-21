import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('numbers', () => {
  it('creates number schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };
    const schema = z.number();

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toEqual(expected);
  });

  it('creates number schema with min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      maximum: 10,
    };
    const schema = z.number().min(0).max(10);

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toEqual(expected);
  });

  it('creates number schema with integer type', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
    };
    const schema = z.number().int();

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toEqual(expected);
  });
});
