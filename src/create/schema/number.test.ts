import { oas30, oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createOutputOpenapi3State, createOutputState } from '../../test/state';

import { createNumberSchema } from './number';

extendZodWithOpenApi(z);

describe('createNumberSchema', () => {
  it('creates a simple number schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
    };
    const schema = z.number();

    const result = createNumberSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates a integer schema', () => {
    const expected: oas31.SchemaObject = {
      type: 'integer',
    };
    const schema = z.number().int();

    const result = createNumberSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lt or gt', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      exclusiveMinimum: 0,
      exclusiveMaximum: 10,
    };
    const schema = z.number().lt(10).gt(0);

    const result = createNumberSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lte or gte', () => {
    const expected: oas31.SchemaObject = {
      type: 'number',
      minimum: 0,
      maximum: 10,
    };
    const schema = z.number().lte(10).gte(0);

    const result = createNumberSchema(schema, createOutputState());

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lte or gte in openapi 3.0.0', () => {
    const expected: oas30.SchemaObject = {
      type: 'number',
      minimum: 0,
      maximum: 10,
    };
    const schema = z.number().lte(10).gte(0);

    const result = createNumberSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });

  it('creates a number schema with lt or gt in openapi 3.0.0', () => {
    const expected: oas30.SchemaObject = {
      type: 'number',
      minimum: 0,
      exclusiveMinimum: true,
      maximum: 10,
      exclusiveMaximum: true,
    };
    const schema = z.number().lt(10).gt(0);

    const result = createNumberSchema(schema, createOutputOpenapi3State());

    expect(result).toStrictEqual(expected);
  });
});
