import { type ZodType, z } from 'zod';

import { extendZodWithOpenApi } from '../../extendZod';
import { createInputState, createOutputState } from '../../testing/state';
import { getDefaultComponents } from '../components';

import { type Schema, type SchemaState, createSchema } from '.';

extendZodWithOpenApi(z);

const zodArray = z.array(z.string());
const expectedZodArray: Schema['schema'] = {
  type: 'array',
  items: {
    type: 'string',
  },
};

const zodBoolean = z.boolean();
const expectedZodBoolean: Schema['schema'] = {
  type: 'boolean',
};

const zodDate = z.date();
const expectedZodDate: Schema['schema'] = {
  type: 'string',
};

const zodDefault = z.string().default('a');
const expectedZodDefault: Schema['schema'] = {
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
const expectedZodDiscriminatedUnion: Schema['schema'] = {
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
const expectedZodEnum: Schema['schema'] = {
  type: 'string',
  enum: ['a', 'b'],
};

const zodIntersection = z.intersection(z.string(), z.number());
const expectedZodIntersection: Schema['schema'] = {
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
const expectedZodLiteral: Schema['schema'] = {
  type: 'string',
  enum: ['a'],
};

const zodMetadata = z.string().openapi({ ref: 'a' });
const expectedZodMetadata: Schema['schema'] = {
  $ref: '#/components/schemas/a',
};

enum Direction {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}
const zodNativeEnum = z.nativeEnum(Direction);
const expectedZodNativeEnum: Schema['schema'] = {
  type: 'string',
  enum: ['Up', 'Down', 'Left', 'Right'],
};

const zodNull = z.null();
const expectedZodNull: Schema['schema'] = {
  type: 'null',
};

const zodNullable = z.string().nullable();
const expectedZodNullable: Schema['schema'] = {
  type: ['string', 'null'],
};

const zodNumber = z.number();
const expectedZodNumber: Schema['schema'] = {
  type: 'number',
};

const zodObject = z.object({
  a: z.string(),
  b: z.string().optional(),
  c: z.string().default('test-default'),
});
const expectedZodObjectInput: Schema['schema'] = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: 'string', default: 'test-default' },
  },
  required: ['a'],
};
const expectedZodObjectOutput: Schema['schema'] = {
  type: 'object',
  properties: {
    a: { type: 'string' },
    b: { type: 'string' },
    c: { type: 'string', default: 'test-default' },
  },
  required: ['a', 'c'],
};

const zodOptional = z.string().optional();
const expectedZodOptional: Schema['schema'] = {
  type: 'string',
};

const zodRecord = z.record(z.string());
const expectedZodRecord: Schema['schema'] = {
  type: 'object',
  additionalProperties: {
    type: 'string',
  },
};

const zodString = z.string();
const expectedZodString: Schema['schema'] = {
  type: 'string',
};

const zodTuple = z.tuple([z.string(), z.number()]);
const expectedZodTuple: Schema['schema'] = {
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
const expectedZodUnion: Schema['schema'] = {
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
const expectedZodCatch: Schema['schema'] = {
  type: 'string',
};

const zodPipeline = z
  .string()
  .transform((arg) => arg.length)
  .pipe(z.number());
const expectedZodPipelineOutput: Schema['schema'] = {
  type: 'number',
};
const expectedZodPipelineInput: Schema['schema'] = {
  type: 'string',
};

const zodTransform = z.string().transform((str) => str.length);
const expectedZodTransform: Schema['schema'] = {
  type: 'string',
};

const zodPreprocess = z.preprocess(
  (arg) => (typeof arg === 'string' ? arg.split(',') : arg),
  z.string(),
);
const expectedZodPreprocess: Schema['schema'] = {
  type: 'string',
};

const zodRefine = z.string().refine((arg) => typeof arg === 'string');
const expectedZodRefine: Schema['schema'] = {
  type: 'string',
};

const zodUnknown = z.unknown();
const expectedManualType: Schema['schema'] = {};

const zodOverride = z.string().openapi({ type: 'number' });
const expectedZodOverride: Schema['schema'] = {
  type: 'number',
};

type Lazy = Lazy[];
const zodLazy: z.ZodType<Lazy> = z
  .lazy(() => zodLazy.array())
  .openapi({ ref: 'lazy' });
const expectedZodLazy: Schema['schema'] = {
  $ref: '#/components/schemas/lazy',
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

const expectedZodLazyComplex: Schema['schema'] = {
  $ref: '#/components/schemas/user',
};

const zodBranded = z.object({ name: z.string() }).brand<'Cat'>();
const expectedZodBranded: Schema['schema'] = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
  required: ['name'],
};

const zodSet = z.set(z.string());
const expectedZodSet: Schema['schema'] = {
  type: 'array',
  items: {
    type: 'string',
  },
  uniqueItems: true,
};

const zodReadonly = z.string().readonly();
const expectedZodReadonly: Schema['schema'] = {
  type: 'string',
};

it('creates an output schema for zodType', () => {
  expect(
    createSchema(zodLazyComplex, createOutputState(), ['previous']),
  ).toEqual(expectedZodLazyComplex);
});

describe('createSchema', () => {
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
    expect(createSchema(schema, createOutputState(), ['previous'])).toEqual(
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
    expect(createSchema(schema, createInputState(), ['previous'])).toEqual(
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
      path: [],
      visited: new Set(),
    };
    createSchema(inputSchema, state, ['previous']);

    const outputState: SchemaState = {
      components,
      type: 'output',
      path: [],
      visited: new Set(),
    };

    const outputSchema = z.object({ b: inputSchema });
    expect(() => createSchema(outputSchema, outputState, ['previous']))
      .toThrowErrorMatchingInlineSnapshot(`
"The ZodObject at previous > property: b is used within a registered compoment schema (a) and contains an input transformation (ZodEffects - transform) defined at previous > property: a which is also used in an output schema.

This may cause the schema to render incorrectly and is most likely a mistake. You can resolve this by:

1. Setting an \`effectType\` on the transformation to \`same\` or \`output\` eg. \`.openapi({type: 'same'})\`
2. Wrapping the transformation in a ZodPipeline
3. Assigning a manual type to the transformation eg. \`.openapi({type: 'string'})\`
4. Removing the transformation
5. Deregistering the component containing the transformation"
`);
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
    createSchema(inputSchema, inputState, ['previous', 'other path']);

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

    expect(() => createSchema(outputSchema, outputState, ['previous', 'path']))
      .toThrowErrorMatchingInlineSnapshot(`
"The ZodEffects - transform at previous > path > property: a is used within a registered compoment schema (input) and contains an input transformation (ZodEffects - transform) defined at previous > other path which is also used in an output schema.

This may cause the schema to render incorrectly and is most likely a mistake. You can resolve this by:

1. Setting an \`effectType\` on the transformation to \`same\` or \`output\` eg. \`.openapi({type: 'same'})\`
2. Wrapping the transformation in a ZodPipeline
3. Assigning a manual type to the transformation eg. \`.openapi({type: 'string'})\`
4. Removing the transformation
5. Deregistering the component containing the transformation"
`);
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
    createSchema(inputSchema, inputState, ['previous', 'other path']);

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

    const result = createSchema(outputSchema, outputState, [
      'previous',
      'path',
    ]);
    expect(result).toEqual({
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
    const result1 = createSchema(inputSchema, inputState, ['previous', 'path']);

    const expectedResult1: Schema['schema'] = {
      type: 'string',
    };
    expect(result1).toStrictEqual(expectedResult1);

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

    const expectedResult2: Schema['schema'] = {
      type: 'object',
      properties: {
        a: {
          type: 'number',
        },
        b: {
          type: 'string',
        },
      },
      required: ['a', 'b'],
    };
    const result2 = createSchema(outputSchema, outputState, [
      'previous',
      'path',
    ]);
    expect(result2).toStrictEqual(expectedResult2);
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

    createSchema(inputSchema, inputState, ['previous', 'other path']);

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

    expect(() => createSchema(outputSchema, outputState, ['previous', 'path']))
      .toThrowErrorMatchingInlineSnapshot(`
"The ZodPipeline at previous > path > property: a is used within a registered compoment schema (input) and contains an input transformation (ZodPipeline) defined at previous > other path which is also used in an output schema.

This may cause the schema to render incorrectly and is most likely a mistake. You can resolve this by:

1. Setting an \`effectType\` on the transformation to \`same\` or \`output\` eg. \`.openapi({type: 'same'})\`
2. Wrapping the transformation in a ZodPipeline
3. Assigning a manual type to the transformation eg. \`.openapi({type: 'string'})\`
4. Removing the transformation
5. Deregistering the component containing the transformation"
`);
  });

  it('throws an error when a lazy schema which contains an effect is used in both an input and output', () => {
    type Post2 = {
      id: string;
      userId: string;
      user: Post;
    };

    const UserIdSchema = z.string().pipe(z.string());

    const PostSchema2: ZodType<Post2> = z
      .object({
        id: z.string(),
        userId: UserIdSchema,
        user: z.lazy(() => PostSchema2).openapi({ ref: 'user' }),
      })
      .openapi({ ref: 'post' });

    const ContainerSchema = z.object({
      post: PostSchema2,
    });

    const state = createOutputState();

    createSchema(ContainerSchema, state, ['previous']);

    const inputState: SchemaState = { ...state, type: 'input' };

    expect(() => createSchema(ContainerSchema, inputState, ['previous']))
      .toThrowErrorMatchingInlineSnapshot(`
"The ZodObject at previous > property: post is used within a registered compoment schema (post) and contains an output transformation (ZodPipeline) defined at previous > property: post > property: userId which is also used in an input schema.

This may cause the schema to render incorrectly and is most likely a mistake. You can resolve this by:

1. Setting an \`effectType\` on the transformation to \`same\` or \`input\` eg. \`.openapi({type: 'same'})\`
2. Wrapping the transformation in a ZodPipeline
3. Assigning a manual type to the transformation eg. \`.openapi({type: 'string'})\`
4. Removing the transformation
5. Deregistering the component containing the transformation"
`);
  });
});
