import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('unknown', () => {
  it('should create an empty schema for unknown', () => {
    const expected: oas31.SchemaObject = {};
    const schema = z.unknown();

    const result = createSchema(schema, createOutputState(), ['unknown']);

    expect(result).toStrictEqual(expected);
  });

  it('should create an empty schema for any', () => {
    const expected: oas31.SchemaObject = {};
    const schema = z.any();

    const result = createSchema(schema, createOutputState(), ['unknown']);

    expect(result).toStrictEqual(expected);
  });
});
