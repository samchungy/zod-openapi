import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('transform', () => {
  it('creates transform schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
    };
    const schema = z.string().transform((val) => val.length);

    const result = createSchema(schema, createOutputState(), ['transform']);

    expect(result).toEqual(expected);
  });

  it('creates transform schema with manual type', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };
    const schema = z.string().transform((val) => val.length).openapi({ type: 'number' });

    const result = createSchema(schema, createOutputState(), ['transform']);

    expect(result).toEqual(expected);
  });
});
