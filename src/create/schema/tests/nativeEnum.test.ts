import { describe, expect, it } from 'vitest';
import * as z from 'zod/v4';

import { type SchemaResult, createSchema } from '../schema.js';

describe('nativeEnum', () => {
  it('creates a string schema from a string enum', () => {
    enum Direction {
      Up = 'Up',
      Down = 'Down',
      Left = 'Left',
      Right = 'Right',
    }

    const schema = z.nativeEnum(Direction);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'string',
        enum: ['Up', 'Down', 'Left', 'Right'],
      },
      components: {},
    });
  });

  it('creates a number schema from an number enum', () => {
    enum Direction {
      Up,
      Down,
      Left,
      Right,
    }

    const schema = z.nativeEnum(Direction);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        type: 'number',
        enum: [0, 1, 2, 3],
      },
      components: {},
    });
  });

  it('creates a string and number schema from a mixed enum', () => {
    enum Direction {
      Up,
      Down,
      Left,
      Right = 'Right',
    }

    const schema = z.enum(Direction);

    const result = createSchema(schema);

    expect(result).toEqual<SchemaResult>({
      schema: {
        enum: [0, 1, 2, 'Right'],
      },
      components: {},
    });
  });
});
