import { z } from 'zod';

import { extendZodWithOpenApi } from '../extendZod';

import { throwTransformError } from './errors';

extendZodWithOpenApi(z);

describe('throwTransformError', () => {
  it('throws an transform error', () => {
    expect(() =>
      throwTransformError(z.string().openapi({ description: 'a' })),
    ).toThrow(
      '{"_def":{"checks":[],"typeName":"ZodString","coerce":false,"openapi":{"description":"a"}}} contains a transform but is used in both an input and an output. This is likely a mistake. Set an `effectType` to resolve',
    );
  });
});
