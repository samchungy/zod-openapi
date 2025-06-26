import { z } from 'zod/v4';

import { validate } from './override';

describe('validate', () => {
  it('should throw an error for a void', () => {
    expect(() =>
      validate(
        {
          zodSchema: z.void(),
          jsonSchema: {},
          io: 'input',
        },
        {},
      ),
    ).toThrow(
      'Zod schema of type `void` cannot be represented in OpenAPI. Please assign it metadata with `.meta()`',
    );
  });

  it('should throw an error for a map', () => {
    expect(() =>
      validate(
        {
          zodSchema: z.map(z.string(), z.number()),
          jsonSchema: {},
          io: 'input',
        },
        {},
      ),
    ).toThrow(
      'Zod schema of type `map` cannot be represented in OpenAPI. Please assign it metadata with `.meta()`',
    );
  });
});
