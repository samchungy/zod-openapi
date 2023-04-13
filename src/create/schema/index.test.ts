import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { getDefaultComponents } from '../components';

import { createSchemaOrRef } from '.';

extendZodWithOpenApi(z);

const zodArray = z.array(z.string());
const expectedZodArray: oas31.SchemaObject = {
  type: 'array',
  items: {
    type: 'string',
  },
};

const zodBoolean = z.boolean();
const expectedZodBoolean: oas31.SchemaObject = {
  type: 'boolean',
};

const zodDate = z.date();
const expectedZodDate: oas31.SchemaObject = {
  type: 'string',
};

const zodDefault = z.string().default('a');
const expectedZodDefault: oas31.SchemaObject = {
  type: 'string',
  default: 'a',
};

const zodDiscriminatedUnion = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('a'),
  }),
  z.object({
    type: z.literal('b'),
  }),
]);
const expectedZodDiscriminatedUnion: oas31.SchemaObject = {
  oneOf: [
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['a'],
        },
      },
      required: ['type'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['b'],
        },
      },
      required: ['type'],
    },
  ],
};

const zodEffect = z.preprocess((arg) => String(arg), z.string());
const expectedZodEffect: oas31.SchemaObject = {
  type: 'string',
};

const zodEnum = z.enum(['a', 'b']);
const expectedZodEnum: oas31.SchemaObject = {
  type: 'string',
  enum: ['a', 'b'],
};

const zodIntersection = z.intersection(z.string(), z.number());
const expectedZodIntersection: oas31.SchemaObject = {
  allOf: [
    {
      type: 'string',
    },
    {
      type: 'number',
    },
  ],
};

const zodLiteral = z.literal('a');
const expectedZodLiteral: oas31.SchemaObject = {
  type: 'string',
  enum: ['a'],
};

const zodMetadata = z.string().openapi({ ref: 'a' });
const expectedZodMetadata: oas31.ReferenceObject = {
  $ref: '#/components/schemas/a',
};

enum Direction {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}
const zodNativeEnum = z.nativeEnum(Direction);
const expectedZodNativeEnum: oas31.SchemaObject = {
  type: 'string',
  enum: ['Up', 'Down', 'Left', 'Right'],
};

const zodNull = z.null();
const expectedZodNull: oas31.SchemaObject = {
  type: 'null',
};

const zodNullable = z.string().nullable();
const expectedZodNullable: oas31.SchemaObject = {
  type: ['string', 'null'],
};

const zodNumber = z.number();
const expectedZodNumber: oas31.SchemaObject = {
  type: 'number',
};

const zodObject = z.object({
  a: z.string(),
  b: z.string().optional(),
});
const expectedZodObject: oas31.SchemaObject = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
  },
  required: ['a'],
};

const zodOptional = z.string().optional();
const expectedZodOptional: oas31.SchemaObject = {
  type: 'string',
};

const zodRecord = z.record(z.string());
const expectedZodReord: oas31.SchemaObject = {
  type: 'object',
  additionalProperties: {
    type: 'string',
  },
};

const zodString = z.string();
const expectedZodString: oas31.SchemaObject = {
  type: 'string',
};

const zodTuple = z.tuple([z.string(), z.number()]);
const expectedZodTuple: oas31.SchemaObject = {
  type: 'array',
  prefixItems: [
    {
      type: 'string',
    },
    {
      type: 'number',
    },
  ],
  minItems: 2,
  maxItems: 2,
};

const zodUnion = z.union([z.string(), z.number()]);
const expectedZodUnion: oas31.SchemaObject = {
  anyOf: [
    {
      type: 'string',
    },
    {
      type: 'number',
    },
  ],
};

describe('createSchemaOrRef', () => {
  it.each`
    zodType                    | schema                   | expected
    ${'ZodArray'}              | ${zodArray}              | ${expectedZodArray}
    ${'ZodBoolean'}            | ${zodBoolean}            | ${expectedZodBoolean}
    ${'ZodDate'}               | ${zodDate}               | ${expectedZodDate}
    ${'ZodDefault'}            | ${zodDefault}            | ${expectedZodDefault}
    ${'ZodDiscriminatedUnion'} | ${zodDiscriminatedUnion} | ${expectedZodDiscriminatedUnion}
    ${'ZodEffect'}             | ${zodEffect}             | ${expectedZodEffect}
    ${'ZodEnum'}               | ${zodEnum}               | ${expectedZodEnum}
    ${'ZodIntersection'}       | ${zodIntersection}       | ${expectedZodIntersection}
    ${'ZodLiteral'}            | ${zodLiteral}            | ${expectedZodLiteral}
    ${'ZodMetadata'}           | ${zodMetadata}           | ${expectedZodMetadata}
    ${'ZodNativeEnum'}         | ${zodNativeEnum}         | ${expectedZodNativeEnum}
    ${'ZodNull'}               | ${zodNull}               | ${expectedZodNull}
    ${'ZodNullable'}           | ${zodNullable}           | ${expectedZodNullable}
    ${'ZodNumber'}             | ${zodNumber}             | ${expectedZodNumber}
    ${'ZodObject'}             | ${zodObject}             | ${expectedZodObject}
    ${'ZodOptional'}           | ${zodOptional}           | ${expectedZodOptional}
    ${'ZodRecord'}             | ${zodRecord}             | ${expectedZodReord}
    ${'ZodString'}             | ${zodString}             | ${expectedZodString}
    ${'ZodTuple'}              | ${zodTuple}              | ${expectedZodTuple}
    ${'ZodUnion'}              | ${zodUnion}              | ${expectedZodUnion}
  `('creates a schema for $zodType', ({ schema, expected }) => {
    expect(createSchemaOrRef(schema, getDefaultComponents())).toEqual(expected);
  });
});
