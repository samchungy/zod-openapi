import '../../entries/extend';
import { z } from 'zod';

import {
  createInputState,
  createOutputOpenapi3State,
  createOutputState,
} from '../../testing/state';

import { type Schema, createSchemaObject } from './index';

describe('enhanceWithMetadata', () => {
  it('adds .openapi metadata', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        description: 'bla',
      },
    };
    const schema = z.string().openapi({ description: 'bla' });

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('adds .describe metadata', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        description: 'bla',
      },
    };
    const schema = z.string().describe('bla');

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('overrides .describe metadata with .openapi metadata', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'string',
        description: 'foo',
      },
    };

    const schema = z.string().describe('bla').openapi({ description: 'foo' });

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('does not add additional descriptions with .describe() to registered schemas', () => {
    const blaSchema = z.string().describe('bla').openapi({ ref: 'bla' });
    const fooSchema = blaSchema.optional();

    const expected: Schema = {
      type: 'ref',
      schema: {
        $ref: '#/components/schemas/bla',
      },
      zodType: blaSchema,
      schemaObject: {
        type: 'string',
        description: 'bla',
      },
    };

    const result = createSchemaObject(fooSchema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('overrides type with .openapi type metadata', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'integer',
      },
    };
    const schema = z.string().openapi({ type: 'integer' });

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('adds adds a description alongside $ref when only description is added in 3.1.0', () => {
    const ref = z.string().openapi({ ref: 'ref' });

    const expected: Schema = {
      type: 'ref',
      schema: {
        $ref: '#/components/schemas/ref',
        description: 'hello',
      },
      zodType: ref,
      schemaObject: {
        type: 'string',
      },
    };

    const schema = ref.optional().openapi({ description: 'hello' });

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('adds adds a description alongside allOf when only description is added in 3.0.0', () => {
    const ref = z.string().openapi({ ref: 'ref' });

    const expected: Schema = {
      type: 'schema',
      schema: {
        allOf: [
          {
            $ref: '#/components/schemas/ref',
          },
        ],
        description: 'hello',
      },
    };

    const schema = ref.optional().openapi({ description: 'hello' });

    const result = createSchemaObject(schema, createOutputOpenapi3State(), []);

    expect(result).toEqual(expected);
  });

  it('adds allOf to $refs only if there is new metadata', () => {
    const ref = z.string().openapi({ ref: 'og' });
    const expected: Schema = {
      type: 'ref',
      schema: {
        $ref: '#/components/schemas/og',
      },
      zodType: ref,
      schemaObject: {
        type: 'string',
      },
    };

    const schema = ref.optional();

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('adds to a registered schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        allOf: [
          {
            $ref: '#/components/schemas/ref2',
          },
        ],
        default: 'a',
      },
    };

    const ref = z.string().openapi({ ref: 'ref2' });
    const schema = ref.optional().default('a');

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('adds to the last element of an allOf schema', () => {
    const expected: Schema = {
      type: 'schema',
      schema: {
        type: 'object',
        properties: {
          b: {
            allOf: [{ $ref: '#/components/schemas/a' }],
            properties: { b: { type: 'string' } },
            required: ['b'],
            description: 'jello',
          },
        },
        required: ['b'],
      },
    };
    const object1 = z.object({ a: z.string() }).openapi({ ref: 'a' });
    const object2 = object1.extend({ b: z.string() });
    const schema = z.object({
      b: object2.openapi({ description: 'jello' }),
    });

    const result = createSchemaObject(schema, createOutputState(), []);

    expect(result).toEqual(expected);
  });

  it('handles current and previous schemas', () => {
    const FooSchema = z.string().openapi({ ref: 'foo' });

    const BarSchema = z.object({
      a: FooSchema.optional(),
      b: FooSchema.openapi({ description: 'bar' }).optional(),
      c: FooSchema.min(1).max(10),
      d: FooSchema.openapi({ description: 'bar' }).min(1).max(10),
      e: FooSchema.catch('a'),
      f: FooSchema.default('a'),
      g: FooSchema.email(),
      h: FooSchema.datetime(),
      i: FooSchema.openapi({ example: 'foo' }).min(1).max(10),
    });

    const result = createSchemaObject(BarSchema, createOutputState(), []);
    const inputResult = createSchemaObject(BarSchema, createInputState(), []);
    expect(result).toMatchInlineSnapshot(`
{
  "effects": [
    {
      "creationType": "output",
      "path": [
        "property: e",
      ],
      "type": "schema",
      "zodType": ZodCatch {
        "_def": {
          "catchValue": [Function],
          "description": undefined,
          "errorMap": [Function],
          "innerType": ZodString {
            "_def": {
              "checks": [],
              "coerce": false,
              "typeName": "ZodString",
              "zodOpenApi": {
                "current": [Circular],
                "openapi": {
                  "ref": "foo",
                },
              },
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "readonly": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          "typeName": "ZodCatch",
        },
        "and": [Function],
        "array": [Function],
        "brand": [Function],
        "catch": [Function],
        "default": [Function],
        "describe": [Function],
        "isNullable": [Function],
        "isOptional": [Function],
        "nullable": [Function],
        "nullish": [Function],
        "optional": [Function],
        "or": [Function],
        "parse": [Function],
        "parseAsync": [Function],
        "pipe": [Function],
        "promise": [Function],
        "readonly": [Function],
        "refine": [Function],
        "refinement": [Function],
        "safeParse": [Function],
        "safeParseAsync": [Function],
        "spa": [Function],
        "superRefine": [Function],
        "transform": [Function],
      },
    },
    {
      "creationType": "output",
      "path": [
        "property: f",
      ],
      "type": "schema",
      "zodType": ZodDefault {
        "_def": {
          "defaultValue": [Function],
          "description": undefined,
          "errorMap": [Function],
          "innerType": ZodString {
            "_def": {
              "checks": [],
              "coerce": false,
              "typeName": "ZodString",
              "zodOpenApi": {
                "current": [Circular],
                "openapi": {
                  "ref": "foo",
                },
              },
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "readonly": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          "typeName": "ZodDefault",
        },
        "and": [Function],
        "array": [Function],
        "brand": [Function],
        "catch": [Function],
        "default": [Function],
        "describe": [Function],
        "isNullable": [Function],
        "isOptional": [Function],
        "nullable": [Function],
        "nullish": [Function],
        "optional": [Function],
        "or": [Function],
        "parse": [Function],
        "parseAsync": [Function],
        "pipe": [Function],
        "promise": [Function],
        "readonly": [Function],
        "refine": [Function],
        "refinement": [Function],
        "safeParse": [Function],
        "safeParseAsync": [Function],
        "spa": [Function],
        "superRefine": [Function],
        "transform": [Function],
      },
    },
  ],
  "schema": {
    "properties": {
      "a": {
        "$ref": "#/components/schemas/foo",
      },
      "b": {
        "$ref": "#/components/schemas/foo",
        "description": "bar",
      },
      "c": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "maxLength": 10,
        "minLength": 1,
      },
      "d": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "description": "bar",
        "maxLength": 10,
        "minLength": 1,
      },
      "e": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "default": "a",
      },
      "f": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "default": "a",
      },
      "g": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "format": "email",
      },
      "h": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "format": "date-time",
      },
      "i": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "example": "foo",
        "maxLength": 10,
        "minLength": 1,
      },
    },
    "required": [
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
    ],
    "type": "object",
  },
  "type": "schema",
}
`);

    expect(inputResult).toMatchInlineSnapshot(`
{
  "effects": [
    {
      "creationType": "input",
      "path": [
        "property: e",
      ],
      "type": "schema",
      "zodType": ZodCatch {
        "_def": {
          "catchValue": [Function],
          "description": undefined,
          "errorMap": [Function],
          "innerType": ZodString {
            "_def": {
              "checks": [],
              "coerce": false,
              "typeName": "ZodString",
              "zodOpenApi": {
                "current": [Circular],
                "openapi": {
                  "ref": "foo",
                },
              },
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "readonly": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          "typeName": "ZodCatch",
        },
        "and": [Function],
        "array": [Function],
        "brand": [Function],
        "catch": [Function],
        "default": [Function],
        "describe": [Function],
        "isNullable": [Function],
        "isOptional": [Function],
        "nullable": [Function],
        "nullish": [Function],
        "optional": [Function],
        "or": [Function],
        "parse": [Function],
        "parseAsync": [Function],
        "pipe": [Function],
        "promise": [Function],
        "readonly": [Function],
        "refine": [Function],
        "refinement": [Function],
        "safeParse": [Function],
        "safeParseAsync": [Function],
        "spa": [Function],
        "superRefine": [Function],
        "transform": [Function],
      },
    },
    {
      "creationType": "input",
      "path": [
        "property: f",
      ],
      "type": "schema",
      "zodType": ZodDefault {
        "_def": {
          "defaultValue": [Function],
          "description": undefined,
          "errorMap": [Function],
          "innerType": ZodString {
            "_def": {
              "checks": [],
              "coerce": false,
              "typeName": "ZodString",
              "zodOpenApi": {
                "current": [Circular],
                "openapi": {
                  "ref": "foo",
                },
              },
            },
            "and": [Function],
            "array": [Function],
            "brand": [Function],
            "catch": [Function],
            "default": [Function],
            "describe": [Function],
            "isNullable": [Function],
            "isOptional": [Function],
            "nullable": [Function],
            "nullish": [Function],
            "optional": [Function],
            "or": [Function],
            "parse": [Function],
            "parseAsync": [Function],
            "pipe": [Function],
            "promise": [Function],
            "readonly": [Function],
            "refine": [Function],
            "refinement": [Function],
            "safeParse": [Function],
            "safeParseAsync": [Function],
            "spa": [Function],
            "superRefine": [Function],
            "transform": [Function],
          },
          "typeName": "ZodDefault",
        },
        "and": [Function],
        "array": [Function],
        "brand": [Function],
        "catch": [Function],
        "default": [Function],
        "describe": [Function],
        "isNullable": [Function],
        "isOptional": [Function],
        "nullable": [Function],
        "nullish": [Function],
        "optional": [Function],
        "or": [Function],
        "parse": [Function],
        "parseAsync": [Function],
        "pipe": [Function],
        "promise": [Function],
        "readonly": [Function],
        "refine": [Function],
        "refinement": [Function],
        "safeParse": [Function],
        "safeParseAsync": [Function],
        "spa": [Function],
        "superRefine": [Function],
        "transform": [Function],
      },
    },
  ],
  "schema": {
    "properties": {
      "a": {
        "$ref": "#/components/schemas/foo",
      },
      "b": {
        "$ref": "#/components/schemas/foo",
        "description": "bar",
      },
      "c": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "maxLength": 10,
        "minLength": 1,
      },
      "d": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "description": "bar",
        "maxLength": 10,
        "minLength": 1,
      },
      "e": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "default": "a",
      },
      "f": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "default": "a",
      },
      "g": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "format": "email",
      },
      "h": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "format": "date-time",
      },
      "i": {
        "allOf": [
          {
            "$ref": "#/components/schemas/foo",
          },
        ],
        "example": "foo",
        "maxLength": 10,
        "minLength": 1,
      },
    },
    "required": [
      "c",
      "d",
      "g",
      "h",
      "i",
    ],
    "type": "object",
  },
  "type": "schema",
}
`);
  });
});
