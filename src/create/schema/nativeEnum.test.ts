import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';

import { createNativeEnumSchema } from './nativeEnum';

extendZodWithOpenApi(z);

describe('createNativeEnumSchema', () => {
  it('creates a string schema from a string enum', () => {
    const expected: oas31.SchemaObject = {
      type: 'string',
      enum: ['Up', 'Down', 'Left', 'Right'],
    };

    enum Direction {
      Up = 'Up',
      Down = 'Down',
      Left = 'Left',
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema from an number enum', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      enum: [0, 1, 2, 3],
    };

    enum Direction {
      Up,
      Down,
      Left,
      Right,
    }
    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema);

    expect(result).toStrictEqual(expected);
  });

  it('creates a string and number schema from a mixed enum', () => {
    const expected: oas31.SchemaObject = {
      type: ['string', 'number'],
      enum: ['Right', 0, 1, 2],
    };

    enum Direction {
      Up,
      Down,
      Left,
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema);

    expect(result).toStrictEqual(expected);
  });
});
