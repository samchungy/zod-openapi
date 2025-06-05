import { z } from 'zod/v4';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

describe('nativeEnum', () => {
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

    const result = createSchema(schema, createOutputState(), ['nativeEnum']);

    expect(result).toEqual(expected);
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

    const result = createSchema(schema, createOutputState(), ['nativeEnum']);

    expect(result).toEqual(expected);
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

    const schema = z.enum(Direction);

    const result = createSchema(schema, createOutputState(), ['nativeEnum']);

    expect(result).toEqual(expected);
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

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'nativeEnum',
    ]);

    expect(result).toEqual(expected);
  });
});
