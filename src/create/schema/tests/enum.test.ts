import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';

describe('enum', () => {
  it('creates a string enum schema', () => {
    const schema = z.enum(['a', 'b']);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'string',
        enum: ['a', 'b'],
      },
      components: {},
    });
  });

  it('creates a string schema from a string enum', () => {
    enum Direction {
      Up = 'Up',
      Down = 'Down',
      Left = 'Left',
      Right = 'Right',
    }

    const schema = z.enum(Direction);

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

    const schema = z.enum(Direction);

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
        enum: [0, 1, 2, 'Right'],
      },
      components: {},
    });
  });
});
