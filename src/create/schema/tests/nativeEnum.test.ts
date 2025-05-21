import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

enum TestEnum {
  A = 'a',
  B = 'b',
}

describe('nativeEnum', () => {
  it('creates native enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['a', 'b'],
    };
    const schema = z.nativeEnum(TestEnum);

    const result = createSchema(schema, createOutputState(), ['nativeEnum']);

    expect(result).toEqual(expected);
  });
});
