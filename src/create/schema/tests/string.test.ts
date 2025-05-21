import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('strings', () => {
  it('creates string schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string();

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toEqual(expected);
  });

  it('creates string schema with min and max', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      minLength: 0,
      maxLength: 10,
    };
    const schema = z.string().min(0).max(10);

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toEqual(expected);
  });

  it('creates string schema with regex', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      pattern: '^[a-z]+$',
    };
    const schema = z.string().regex(/^[a-z]+$/);

    const result = createSchema(schema, createOutputState(), ['string']);

    expect(result).toEqual(expected);
  });
});
