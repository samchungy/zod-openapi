import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

import { createNativeEnumSchema } from './nativeEnum';

describe('createNativeEnumSchema', () => {
  it('creates a string schema from a string enum', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        enum: ['Up', 'Down', 'Left', 'Right'],
      },
    };

    enum Direction {
      Up = 'Up',
      Down = 'Down',
      Left = 'Left',
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a number schema from an number enum', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'number',
        enum: [0, 1, 2, 3],
      },
    };

    enum Direction {
      Up,
      Down,
      Left,
      Right,
    }
    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a string and number schema from a mixed enum', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: ['string', 'number'],
        enum: ['Right', 0, 1, 2],
      },
    };

    enum Direction {
      Up,
      Down,
      Left,
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema, createOutputState());

    expect(result).toEqual(expected);
  });

  it('creates a oneOf string and number schema from a mixed enum in openapi 3.0.0', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
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
      },
    };

    enum Direction {
      Up,
      Down,
      Left,
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createNativeEnumSchema(schema, createOutputOpenapi3State());

    expect(result).toEqual(expected);
  });
});
