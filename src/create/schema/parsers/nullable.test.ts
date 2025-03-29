import '../../../entries/extend';
import { z } from 'zod';

import type { Schema } from '..';
import type { oas30, oas31 } from '../../../openapi3-ts/dist';
import {
  createOutputOpenapi3State,
  createOutputState,
} from '../../../testing/state';

import { createNullableSchema } from './nullable';

describe('createNullableSchema', () => {
  describe('openapi 3.0.0', () => {
    it('creates a simple nullable string schema', () => {
      const expectedOas30: oas30.SchemaObject = {
        type: 'string',
        nullable: true,
      };
      const expected: Schema = {
        type: 'schema',
        schema: expectedOas30 as unknown as oas31.SchemaObject,
      };
      const schema = z.string().nullable();

      const result = createNullableSchema(schema, createOutputOpenapi3State());

      expect(result).toEqual(expected);
    });

    it('creates an allOf nullable schema for registered schemas', () => {
      const expectedOas30: oas30.SchemaObject = {
        allOf: [{ $ref: '#/components/schemas/a' }],
        nullable: true,
      };
      const expected: Schema = {
        type: 'schema',
        schema: expectedOas30 as unknown as oas31.SchemaObject,
      };
      const registered = z.string().openapi({ ref: 'a' });
      const schema = registered.optional().nullable();

      const result = createNullableSchema(schema, createOutputOpenapi3State());

      expect(result).toEqual(expected);
    });

    it('creates an anyOf nullable schema', () => {
      const expectedOas30: oas30.SchemaObject = {
        anyOf: [
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
        nullable: true,
      };
      const expected: Schema = {
        type: 'schema',
        schema: expectedOas30 as unknown as oas31.SchemaObject,
      };
      const schema = z
        .union([z.object({ a: z.string() }), z.object({ b: z.string() })])
        .nullable();

      const result = createNullableSchema(schema, createOutputOpenapi3State());

      expect(result).toEqual(expected);
    });

    it('creates a nullable allOf nullable schema', () => {
      const expectedOas30: oas30.SchemaObject = {
        type: 'object',
        properties: {
          b: {
            allOf: [{ $ref: '#/components/schemas/a' }],
            properties: { b: { type: 'string' } },
            required: ['b'],
            nullable: true,
          },
        },
        required: ['b'],
        nullable: true,
      };
      const expected: Schema = {
        type: 'schema',
        schema: expectedOas30 as unknown as oas31.SchemaObject,
      };

      const object1 = z.object({ a: z.string() }).openapi({ ref: 'a' });
      const object2 = object1.extend({ b: z.string() });
      const schema = z.object({ b: object2.nullable() }).nullable();

      const result = createNullableSchema(schema, createOutputOpenapi3State());

      expect(result).toEqual(expected);
    });

    it('creates a nullable enum', () => {
      const expectedOas30: oas30.SchemaObject = {
        type: 'string',
        nullable: true,
        enum: ['a', null],
      };
      const expected: Schema = {
        type: 'schema',
        schema: expectedOas30 as unknown as oas31.SchemaObject,
      };

      const schema = z.enum(['a']).nullable();

      const result = createNullableSchema(schema, createOutputOpenapi3State());

      expect(result).toEqual(expected);
    });
  });

  describe('openapi 3.1.0', () => {
    it('creates a simple nullable string schema', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: ['string', 'null'],
        },
      };
      const schema = z.string().nullable();

      const result = createNullableSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('creates an oneOf nullable schema for registered schemas', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          oneOf: [
            {
              $ref: '#/components/schemas/a',
            },
            {
              type: 'null',
            },
          ],
        },
      };
      const registered = z.string().openapi({ ref: 'a' });
      const schema = registered.optional().nullable();

      const result = createNullableSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('creates an anyOf nullable schema', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          anyOf: [
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
              type: 'null',
            },
          ],
        },
      };
      const schema = z
        .union([z.object({ a: z.string() }), z.object({ b: z.string() })])
        .nullable();

      const result = createNullableSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('creates a nullable allOf nullable schema', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: ['object', 'null'],
          properties: {
            b: {
              oneOf: [
                {
                  allOf: [{ $ref: '#/components/schemas/a' }],
                  properties: { b: { type: 'string' } },
                  required: ['b'],
                },
                { type: 'null' },
              ],
            },
          },
          required: ['b'],
        },
      };
      const object1 = z.object({ a: z.string() }).openapi({ ref: 'a' });
      const object2 = object1.extend({ b: z.string() });
      const schema = z.object({ b: object2.nullable() }).nullable();

      const result = createNullableSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('creates a nullable enum', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: ['string', 'null'],
          enum: ['a', null],
        },
      };
      const schema = z.enum(['a']).nullable();

      const result = createNullableSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });

    it('creates a nullable enum from a literal', () => {
      const expected: Schema = {
        type: 'schema',
        schema: {
          type: ['string', 'null'],
          enum: ['a', null],
        },
      };
      const schema = z.literal('a').nullable();

      const result = createNullableSchema(schema, createOutputState());

      expect(result).toEqual(expected);
    });
  });
});
