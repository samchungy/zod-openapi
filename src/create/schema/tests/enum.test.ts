import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('enums', () => {
  it('creates enum schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['A', 'B', 'C'],
    };
    const schema = z.enum(['A', 'B', 'C']);

    const result = createSchema(schema, createOutputState(), ['enum']);

    expect(result).toEqual(expected);
  });

  it('creates native enum schema', () => {
    enum TestEnum {
      A = 'A',
      B = 'B',
      C = 'C',
    }
    
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['A', 'B', 'C'],
    };
    const schema = z.nativeEnum(TestEnum);

    const result = createSchema(schema, createOutputState(), ['enum']);

    expect(result).toEqual(expected);
  });
});
