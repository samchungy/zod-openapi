import '../../../entries/extend';
import { z } from 'zod';

import { createSchema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';
import { createOutputState } from '../../../testing/state';

describe('intersection', () => {
  it('creates an intersection schema', () => {
    const expected: oas31.SchemaObject = {
      allOf: [
        {
          type: 'string',
        },
        {
          type: 'number',
        },
      ],
    };

    const schema = z.intersection(z.string(), z.number());

    const result = createSchema(schema, createOutputState(), ['intersection']);

    expect(result).toEqual(expected);
  });

  it('creates an object with an allOf', () => {
    const schema = z.object({
      a: z.string(),
    });

    const andSchema = schema.and(
      z.object({
        b: z.string(),
      }),
    );

    const result = createSchema(andSchema, createOutputState(), [
      'intersection',
    ]);

    expect(result).toEqual<oas31.SchemaObject>({
      allOf: [
        {
          type: 'object',
          properties: {
            a: {
              type: 'string',
            },
          },
          required: ['a'],
        },
        {
          type: 'object',
          properties: {
            b: {
              type: 'string',
            },
          },
          required: ['b'],
        },
      ],
    });
  });

  it('attempts to flatten nested and usage', () => {
    const schema = z.object({
      a: z.string(),
    });

    const schema2 = z.object({
      b: z.string(),
    });

    const schema3 = z.object({
      c: z.string(),
    });

    const result = createSchema(
      schema.and(schema2).and(schema3),
      createOutputState(),
      ['intersection'],
    );

    expect(result).toEqual<oas31.SchemaObject>({
      allOf: [
        {
          type: 'object',
          properties: {
            a: {
              type: 'string',
            },
          },
          required: ['a'],
        },
        {
          type: 'object',
          properties: {
            b: {
              type: 'string',
            },
          },
          required: ['b'],
        },
        {
          type: 'object',
          properties: {
            c: {
              type: 'string',
            },
          },
          required: ['c'],
        },
      ],
    });
  });
});
