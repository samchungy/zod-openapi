import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../testing/state';

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

    const result = createNativeEnumSchema(schema, createOutputState());

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

    const result = createNativeEnumSchema(schema, createOutputState());

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

    const result = createNativeEnumSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates a oneOf string and number schema from a mixed enum in openapi 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      oneOf: [
        {
          type: 'string',
          enum: ['Right'],
        },
        {
          type: 'number',
          enum: [0, 1, 2],
        },
      ],
    };

    enum Direction {
      Up,
      Down,
      Left,
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });
});
