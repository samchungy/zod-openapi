import { z } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';

import { createUnknownSchema } from './unknown';

describe('createUnknownSchema', () => {
  it('should create an empty schema for unknown', () => {
    const expected: oas31.SchemaObject = {};
    const result = createUnknownSchema(z.unknown());

    expect(result).toStrictEqual(expected);
  });

  it('should create an empty schema for any', () => {
    const expected: oas31.SchemaObject = {};
    const result = createUnknownSchema(z.any());

    expect(result).toStrictEqual(expected);
  });
});
