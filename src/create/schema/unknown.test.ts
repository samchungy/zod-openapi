import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { createUnknownSchema } from './unknown';

describe('createUnknownSchema', () => {
  it('should create an empty schema', () => {
    const expected: oas31.SchemaObject = {};
    const result = createUnknownSchema(z.unknown());

    expect(result).toStrictEqual(expected);
  });
});
