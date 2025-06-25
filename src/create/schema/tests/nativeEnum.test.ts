import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '..';

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

    expect(result).toEqual<CreateSchemaResult>({
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

    expect(result).toEqual<CreateSchemaResult>({
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

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: ['string', 'number'],
        enum: ['Right', 0, 1, 2],
      },
      components: {},
    });
  });
});
