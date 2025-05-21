import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('union', () => {
  it('creates an anyOf schema for a union', () => {
    const expected: oas31.SchemaObject = {
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z.union([z.string(), z.number()]);

    const result = createSchema(schema, createOutputState(), ['union']);

    expect(result).toEqual(expected);
  });

  it('creates an oneOf schema for a union if unionOneOf is true', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z
      .union([z.string(), z.number()])
      .openapi({ unionOneOf: true });

    const result = createSchema(schema, createOutputState(), ['union']);

    expect(result).toEqual(expected);
  });

  it('creates an oneOf schema for a union if the document options unionOneOf is true', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z.union([z.string(), z.number()]);

    const result = createSchema(
      schema,
      createOutputState(undefined, { unionOneOf: true }),
      ['union'],
    );

    expect(result).toEqual(expected);
  });

  it('preferences individual unionOneOf over global setting', () => {
    const expected: oas31.SchemaObject = {
      anyOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };
    const schema = z
      .union([z.string(), z.number()])
      .openapi({ unionOneOf: false });

    const result = createSchema(
      schema,
      createOutputState(undefined, { unionOneOf: true }),
      ['union'],
    );

    expect(result).toEqual(expected);
  });

  it('ignores optional values in a union', () => {
    const schema = z.union([
      z.string(),
      z.literal(undefined),
      z.undefined(),
      z.never(),
    ]);

    const result = createSchema(schema, createOutputState(), ['union']);

    expect(result).toEqual<oas31.SchemaObject>({
      anyOf: [
        {
          type: 'string',
        },
      ],
    });
  });
});
