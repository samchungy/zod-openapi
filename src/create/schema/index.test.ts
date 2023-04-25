import { oas31 } from 'openapi3-ts';
import { z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createInputState, createOutputState } from '../../testing/state';
import { getDefaultComponents } from '../components';

import { SchemaState, createSchemaOrRef } from '.';

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
const expectedZodRecord: oas31.SchemaObject = {
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

const zodCatch = z.string().catch('bob');
const expectedZodCatch: oas31.SchemaObject = {
  type: 'string',
};

const zodPipeline = z
  .string()
  .transform((arg) => arg.length)
  .pipe(z.number());
const expectedZodPipelineOutput: oas31.SchemaObject = {
  type: 'number',
};
const expectedZodPipelineInput: oas31.SchemaObject = {
  type: 'string',
};

const zodTransform = z.string().transform((str) => str.length);
const expectedZodTransform: oas31.SchemaObject = {
  type: 'string',
};

const zodPreprocess = z.preprocess(
  (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
  z.string(),
);
const expectedZodPreprocess: oas31.SchemaObject = {
  type: 'string',
};

const zodRefine = z.string().refine((arg) => typeof arg === 'string');
const expectedZodRefine: oas31.SchemaObject = {
  type: 'string',
};

const zodUnknwn = z.unknown();
const expectedManualType: oas31.SchemaObject = {};

const zodOverride = z.string().openapi({ type: 'number' });
const expectedZodOverride: oas31.SchemaObject = {
  type: 'number',
};

describe('createSchemaOrRef', () => {
  it.each`
    zodType                      | schema                   | expected
    ${'ZodArray'}                | ${zodArray}              | ${expectedZodArray}
    ${'ZodBoolean'}              | ${zodBoolean}            | ${expectedZodBoolean}
    ${'ZodDate'}                 | ${zodDate}               | ${expectedZodDate}
    ${'ZodDefault'}              | ${zodDefault}            | ${expectedZodDefault}
    ${'ZodDiscriminatedUnion'}   | ${zodDiscriminatedUnion} | ${expectedZodDiscriminatedUnion}
    ${'ZodEnum'}                 | ${zodEnum}               | ${expectedZodEnum}
    ${'ZodIntersection'}         | ${zodIntersection}       | ${expectedZodIntersection}
    ${'ZodLiteral'}              | ${zodLiteral}            | ${expectedZodLiteral}
    ${'ZodMetadata'}             | ${zodMetadata}           | ${expectedZodMetadata}
    ${'ZodNativeEnum'}           | ${zodNativeEnum}         | ${expectedZodNativeEnum}
    ${'ZodNull'}                 | ${zodNull}               | ${expectedZodNull}
    ${'ZodNullable'}             | ${zodNullable}           | ${expectedZodNullable}
    ${'ZodNumber'}               | ${zodNumber}             | ${expectedZodNumber}
    ${'ZodObject'}               | ${zodObject}             | ${expectedZodObject}
    ${'ZodOptional'}             | ${zodOptional}           | ${expectedZodOptional}
    ${'ZodRecord'}               | ${zodRecord}             | ${expectedZodRecord}
    ${'ZodString'}               | ${zodString}             | ${expectedZodString}
    ${'ZodTuple'}                | ${zodTuple}              | ${expectedZodTuple}
    ${'ZodUnion'}                | ${zodUnion}              | ${expectedZodUnion}
    ${'ZodCatch'}                | ${zodCatch}              | ${expectedZodCatch}
    ${'ZodPipeline'}             | ${zodPipeline}           | ${expectedZodPipelineOutput}
    ${'ZodEffects - Preprocess'} | ${zodPreprocess}         | ${expectedZodPreprocess}
    ${'ZodEffects - Refine'}     | ${zodRefine}             | ${expectedZodRefine}
    ${'manual type'}             | ${zodUnknwn}             | ${expectedManualType}
    ${'override'}                | ${zodOverride}           | ${expectedZodOverride}
  `('creates an output schema for $zodType', ({ schema, expected }) => {
    expect(createSchemaOrRef(schema, createOutputState())).toStrictEqual(
      expected,
    );
  });

  it.each`
    zodType                      | schema                   | expected
    ${'ZodArray'}                | ${zodArray}              | ${expectedZodArray}
    ${'ZodBoolean'}              | ${zodBoolean}            | ${expectedZodBoolean}
    ${'ZodDate'}                 | ${zodDate}               | ${expectedZodDate}
    ${'ZodDefault'}              | ${zodDefault}            | ${expectedZodDefault}
    ${'ZodDiscriminatedUnion'}   | ${zodDiscriminatedUnion} | ${expectedZodDiscriminatedUnion}
    ${'ZodEnum'}                 | ${zodEnum}               | ${expectedZodEnum}
    ${'ZodIntersection'}         | ${zodIntersection}       | ${expectedZodIntersection}
    ${'ZodLiteral'}              | ${zodLiteral}            | ${expectedZodLiteral}
    ${'ZodMetadata'}             | ${zodMetadata}           | ${expectedZodMetadata}
    ${'ZodNativeEnum'}           | ${zodNativeEnum}         | ${expectedZodNativeEnum}
    ${'ZodNull'}                 | ${zodNull}               | ${expectedZodNull}
    ${'ZodNullable'}             | ${zodNullable}           | ${expectedZodNullable}
    ${'ZodNumber'}               | ${zodNumber}             | ${expectedZodNumber}
    ${'ZodObject'}               | ${zodObject}             | ${expectedZodObject}
    ${'ZodOptional'}             | ${zodOptional}           | ${expectedZodOptional}
    ${'ZodRecord'}               | ${zodRecord}             | ${expectedZodRecord}
    ${'ZodString'}               | ${zodString}             | ${expectedZodString}
    ${'ZodTuple'}                | ${zodTuple}              | ${expectedZodTuple}
    ${'ZodUnion'}                | ${zodUnion}              | ${expectedZodUnion}
    ${'ZodCatch'}                | ${zodCatch}              | ${expectedZodCatch}
    ${'ZodPipeline'}             | ${zodPipeline}           | ${expectedZodPipelineInput}
    ${'ZodEffects - Preprocess'} | ${zodPreprocess}         | ${expectedZodPreprocess}
    ${'ZodEffects - Transform'}  | ${zodTransform}          | ${expectedZodTransform}
    ${'ZodEffects - Refine'}     | ${zodRefine}             | ${expectedZodRefine}
    ${'unknown'}                 | ${zodUnknwn}             | ${expectedManualType}
  `('creates an input schema for $zodType', ({ schema, expected }) => {
    expect(createSchemaOrRef(schema, createInputState())).toStrictEqual(
      expected,
    );
  });

  it('throws an error when an ZodEffect input component is referenced in an output', () => {
    const inputSchema = z
      .object({ a: z.string().transform((arg) => arg.length) })
      .openapi({ ref: 'a' });
    const components = getDefaultComponents();
    const state: SchemaState = {
      components,
      type: 'input',
    };
    createSchemaOrRef(inputSchema, state);

    const outputState: SchemaState = {
      components,
      type: 'output',
    };

    const outputSchema = z.object({ a: inputSchema });
    expect(() => createSchemaOrRef(outputSchema, outputState)).toThrow(
      'schemaRef "a" was created with a ZodTransform meaning that the input type is different from the output type. This type is currently being referenced in a response and request. Wrap it in a ZodPipeline, assign it a manual type or effectType',
    );
  });

  it('throws an error when a schema is generated with a different effectTypes', () => {
    const inputSchema = z.string().transform((arg) => arg.length);

    const outputSchema = z.object({
      a: inputSchema,
      b: z.string(),
    });
    const components = getDefaultComponents();
    const state: SchemaState = {
      components,
      type: 'input',
      effectType: 'output',
    };

    expect(() => createSchemaOrRef(outputSchema, state)).toThrow(
      '{"_def":{"unknownKeys":"strip","catchall":{"_def":{"typeName":"ZodNever"}},"typeName":"ZodObject"},"_cached":null} contains a transform but is used in both an input and an output. This is likely a mistake. Set an `effectType` to resolve',
    );
  });
});
