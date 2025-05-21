import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('defaults', () => {
  it('creates schema with default value', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      default: 'test',
    };
    const schema = z.string().default('test');

    const result = createSchema(schema, createOutputState(), ['default']);

    expect(result).toEqual(expected);
  });
});
