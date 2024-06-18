import { z } from 'zod';

import type { Schema } from '../schema';

import { createUnknownSchema } from './unknown';

describe('createUnknownSchema', () => {
  it('should create an empty schema for unknown', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {},
    };
    const result = createUnknownSchema(z.unknown());

    expect(result).toStrictEqual(expected);
  });

  it('should create an empty schema for any', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {},
    };
    const result = createUnknownSchema(z.any());

    expect(result).toStrictEqual(expected);
  });
});
