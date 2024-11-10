import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import { createOutputState } from '../../../testing/state';

import { createIntersectionSchema } from './intersection';

describe('createIntersectionSchema', () => {
  it('creates an intersection schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        allOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
        ],
      },
    };
    const schema = z.intersection(z.string(), z.number());

    const result = createIntersectionSchema(schema, createOutputState());

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

    const result = createIntersectionSchema(andSchema, createOutputState());

    expect(result).toEqual<Schema>({
      type: 'schema',
      schema: {
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
      },
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

    const result = createIntersectionSchema(
      schema.and(schema2).and(schema3),
      createOutputState(),
    );

    expect(result).toEqual<Schema>({
      type: 'schema',
      schema: {
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
      },
    });
  });
});
