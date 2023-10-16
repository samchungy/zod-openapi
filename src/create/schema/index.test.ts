import { type ZodType, z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import type { oas31 } from '../../openapi3-ts/dist';
import { createInputState, createOutputState } from '../../testing/state';
import { getDefaultComponents } from '../components';

import { type SchemaState, createSchemaObject, newSchemaState } from '.';

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
  c: z.string().default('test-default'),
});
const expectedZodObjectInput: oas31.SchemaObject = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: 'string', default: 'test-default' },
  },
  required: ['a'],
};
const expectedZodObjectOutput: oas31.SchemaObject = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: 'string', default: 'test-default' },
  },
  required: ['a', 'c'],
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

const zodUnknown = z.unknown();
const expectedManualType: oas31.SchemaObject = {};

const zodOverride = z.string().openapi({ type: 'number' });
const expectedZodOverride: oas31.SchemaObject = {
  type: 'number',
};

type Lazy = Lazy[];
const zodLazy: z.ZodType<Lazy> = z
  .lazy(() => zodLazy.array())
  .openapi({ ref: 'lazy' });
const expectedZodLazy: oas31.ReferenceObject = {
  $ref: '#/components/schemas/lazy',
};

const expectedZodLazyComplex: oas31.ReferenceObject = {
  $ref: '#/components/schemas/user',
};

const BasePost = z.object({
  id: z.string(),
  userId: z.string(),
});

type Post = z.infer<typeof BasePost> & {
  user?: User;
};

const BaseUser = z.object({
  id: z.string(),
});

type User = z.infer<typeof BaseUser> & {
  posts?: Post[];
};

const PostSchema: ZodType<Post> = BasePost.extend({
  user: z.lazy(() => zodLazyComplex).optional(),
}).openapi({ ref: 'post' });

const zodLazyComplex: ZodType<User> = BaseUser.extend({
  posts: z.array(z.lazy(() => PostSchema)).optional(),
}).openapi({ ref: 'user' });

const zodBranded = z.object({ name: z.string() }).brand<'Cat'>();
const expectedZodBranded: oas31.SchemaObject = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
  required: ['name'],
};

const zodSet = z.set(z.string());
const expectedZodSet: oas31.SchemaObject = {
  type: 'array',
  items: {
    type: 'string',
  },
  uniqueItems: true,
};

const zodReadonly = z.string().readonly();
const expectedZodReadonly: oas31.SchemaObject = {
  type: 'string',
};

describe('createSchemaObject', () => {
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
    ${'ZodObject'}               | ${zodObject}             | ${expectedZodObjectOutput}
    ${'ZodOptional'}             | ${zodOptional}           | ${expectedZodOptional}
    ${'ZodRecord'}               | ${zodRecord}             | ${expectedZodRecord}
    ${'ZodString'}               | ${zodString}             | ${expectedZodString}
    ${'ZodTuple'}                | ${zodTuple}              | ${expectedZodTuple}
    ${'ZodUnion'}                | ${zodUnion}              | ${expectedZodUnion}
    ${'ZodCatch'}                | ${zodCatch}              | ${expectedZodCatch}
    ${'ZodPipeline'}             | ${zodPipeline}           | ${expectedZodPipelineOutput}
    ${'ZodEffects - Preprocess'} | ${zodPreprocess}         | ${expectedZodPreprocess}
    ${'ZodEffects - Refine'}     | ${zodRefine}             | ${expectedZodRefine}
    ${'manual type'}             | ${zodUnknown}            | ${expectedManualType}
    ${'override'}                | ${zodOverride}           | ${expectedZodOverride}
    ${'ZodLazy'}                 | ${zodLazy}               | ${expectedZodLazy}
    ${'ZodLazy - Complex'}       | ${zodLazyComplex}        | ${expectedZodLazyComplex}
    ${'ZodBranded'}              | ${zodBranded}            | ${expectedZodBranded}
    ${'ZodSet'}                  | ${zodSet}                | ${expectedZodSet}
    ${'ZodReadonly'}             | ${zodReadonly}           | ${expectedZodReadonly}
  `('creates an output schema for $zodType', ({ schema, expected }) => {
    expect(
      createSchemaObject(schema, createOutputState(), ['previous']),
    ).toStrictEqual(expected);
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
    ${'ZodObject'}               | ${zodObject}             | ${expectedZodObjectInput}
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
    ${'unknown'}                 | ${zodUnknown}            | ${expectedManualType}
    ${'ZodLazy'}                 | ${zodLazy}               | ${expectedZodLazy}
    ${'ZodLazy - Complex'}       | ${zodLazyComplex}        | ${expectedZodLazyComplex}
    ${'ZodBranded'}              | ${zodBranded}            | ${expectedZodBranded}
    ${'ZodSet'}                  | ${zodSet}                | ${expectedZodSet}
    ${'ZodReadonly'}             | ${zodReadonly}           | ${expectedZodReadonly}
  `('creates an input schema for $zodType', ({ schema, expected }) => {
    expect(
      createSchemaObject(schema, createInputState(), ['previous']),
    ).toStrictEqual(expected);
  });

  it('throws an error when an ZodEffect input component is referenced in an output', () => {
    const inputSchema = z
      .object({ a: z.string().transform((arg) => arg.length) })
      .openapi({ ref: 'a' });
    const components = getDefaultComponents();
    const state: SchemaState = newSchemaState({
      components,
      type: 'input',
      path: [],
      visited: new Set(),
    });
    createSchemaObject(inputSchema, state, ['previous']);

    const outputState: SchemaState = newSchemaState({
      components,
      type: 'output',
      path: [],
      visited: new Set(),
    });

    const outputSchema = z.object({ a: inputSchema });
    expect(() =>
      createSchemaObject(outputSchema, outputState, ['previous']),
    ).toThrow(
      '{"_def":{"unknownKeys":"strip","catchall":{"_def":{"typeName":"ZodNever"}},"typeName":"ZodObject","openapi":{"ref":"a"}},"_cached":null} at previous > property: a contains a transformation but is used in both an input and an output. This is likely a mistake. Set an `effectType`, wrap it in a ZodPipeline or assign it a manual type to resolve',
    );
  });

  it('throws an error when a registered transform is generated with different types', () => {
    const inputSchema = z
      .string()
      .transform((arg) => arg.length)
      .openapi({ ref: 'input' });

    const components = getDefaultComponents();

    const inputState: SchemaState = {
      components,
      type: 'input',
      path: [],
      visited: new Set(),
    };
    createSchemaObject(inputSchema, inputState, ['previous', 'path']);

    const outputSchema = z.object({
      a: inputSchema,
      b: z.string(),
    });
    const outputState: SchemaState = {
      components,
      type: 'output',
      path: [],
      visited: new Set(),
    };

    expect(() =>
      createSchemaObject(outputSchema, outputState, ['previous', 'path']),
    ).toThrow(
      '{"_def":{"schema":{"_def":{"checks":[],"typeName":"ZodString","coerce":false}},"typeName":"ZodEffects","effect":{"type":"transform"},"openapi":{"ref":"input"}}} at previous > path > property: a contains a transformation but is used in both an input and an output. This is likely a mistake. Set an `effectType`, wrap it in a ZodPipeline or assign it a manual type to resolve',
    );
  });

  it('does not throw an error when a transform is generated with different types', () => {
    const inputSchema = z
      .string()
      .transform((arg) => arg.length)
      .openapi({ effectType: 'input' });

    const components = getDefaultComponents();

    const inputState: SchemaState = {
      components,
      type: 'input',
      path: [],
      visited: new Set(),
    };
    createSchemaObject(inputSchema, inputState, ['previous', 'path']);

    const outputSchema = z.object({
      a: inputSchema,
      b: z.string(),
    });
    const outputState: SchemaState = {
      components,
      type: 'output',
      path: [],
      visited: new Set(),
    };

    const result = createSchemaObject(outputSchema, outputState, [
      'previous',
      'path',
    ]);
    expect(result).toStrictEqual({
      properties: {
        a: {
          type: 'string',
        },
        b: {
          type: 'string',
        },
      },
      required: ['a', 'b'],
      type: 'object',
    });
  });

  it('does not throw an error when a pipe is generated with different types', () => {
    const inputSchema = z.string().pipe(z.number());

    const components = getDefaultComponents();

    const inputState: SchemaState = {
      components,
      type: 'input',
      path: [],
      visited: new Set(),
    };
    const result1 = createSchemaObject(inputSchema, inputState, [
      'previous',
      'path',
    ]);
    expect(result1).toStrictEqual({
      type: 'string',
    });

    const outputSchema = z.object({
      a: inputSchema,
      b: z.string(),
    });
    const outputState: SchemaState = {
      components,
      type: 'output',
      path: [],
      visited: new Set(),
    };

    const result2 = createSchemaObject(outputSchema, outputState, [
      'previous',
      'path',
    ]);
    expect(result2).toStrictEqual({
      properties: {
        a: {
          type: 'number',
        },
        b: {
          type: 'string',
        },
      },
      required: ['a', 'b'],
      type: 'object',
    });
  });

  it('throws an error when a pipe is generated with different types', () => {
    const inputSchema = z.string().pipe(z.number()).openapi({ ref: 'input' });

    const components = getDefaultComponents();

    const inputState: SchemaState = {
      components,
      type: 'input',
      path: [],
      visited: new Set(),
    };

    createSchemaObject(inputSchema, inputState, ['previous', 'path']);

    const outputSchema = z.object({
      a: inputSchema,
      b: z.string(),
    });
    const outputState: SchemaState = {
      components,
      type: 'output',
      path: [],
      visited: new Set(),
    };

    expect(() =>
      createSchemaObject(outputSchema, outputState, ['previous', 'path']),
    ).toThrow(
      '{"_def":{"in":{"_def":{"checks":[],"typeName":"ZodString","coerce":false}},"out":{"_def":{"checks":[],"typeName":"ZodNumber","coerce":false}},"typeName":"ZodPipeline","openapi":{"ref":"input"}}} at previous > path > property: a contains a transformation but is used in both an input and an output. This is likely a mistake. Set an `effectType`, wrap it in a ZodPipeline or assign it a manual type to resolve',
    );
  });
});
