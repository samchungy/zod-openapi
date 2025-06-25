import { z } from 'zod/v4';

import { type CreateSchemaResult, createSchema } from '../schema';

describe('number', () => {
  it('creates a simple number schema', () => {
    const schema = z.number();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'number',
      },
      components: {},
    });
  });

  it('creates a integer schema', () => {
    const schema = z.number().int();

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'integer',
        maximum: 9007199254740991,
        minimum: -9007199254740991,
      },
      components: {},
    });
  });

  it('creates a number schema with lt or gt', () => {
    const schema = z.number().lt(10).gt(0);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'number',
        exclusiveMinimum: 0,
        exclusiveMaximum: 10,
      },
      components: {},
    });
  });

  it('creates a number schema with lte or gte', () => {
    const schema = z.number().lte(10).gte(0);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'number',
        minimum: 0,
        maximum: 10,
      },
      components: {},
    });
  });

  it('supports multipleOf', () => {
    const schema = z.number().multipleOf(2);

    const result = createSchema(schema);

    expect(result).toEqual<CreateSchemaResult>({
      schema: {
        type: 'number',
        multipleOf: 2,
      },
      components: {},
    });
  });
});
