import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

describe('number', () => {
  it('creates a simple number schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };

    const schema = z.number();

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a integer schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
    };

    const schema = z.number().int();

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lt or gt', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      exclusiveMinimum: 0,
      exclusiveMaximum: 10,
    };

    const schema = z.number().lt(10).gt(0);

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lte or gte', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      maximum: 10,
    };

    const schema = z.number().lte(10).gte(0);

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lte or gte in openapi 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      maximum: 10,
    };

    const schema = z.number().lte(10).gte(0);

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'number',
    ]);

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lt or gt in openapi 3.0.0', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true,
      maximum: 10,
      exclusiveMaximum: true,
    } as unknown as oas31.SchemaObject;

    const schema = z.number().lt(10).gt(0);

    const result = createSchema(schema, createOutputOpenapi3State(), [
      'number',
    ]);

    expect(result).toStrictEqual(expected);
  });

  it('supports multipleOf', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      multipleOf: 2,
    };

    const schema = z.number().multipleOf(2);

    const result = createSchema(schema, createOutputState(), ['number']);

    expect(result).toStrictEqual(expected);
  });
});
