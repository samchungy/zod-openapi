<p align="center">
  <img src="zod-openapi.svg" width="200px" align="center" alt="zod-openapi logo" />
  <h1 align="center">zod-openapi</h1>
</p>
<p align="center">
A TypeScript library for using <a href="https://github.com/colinhacks/zod">Zod</a> schemas to generate OpenAPI v3.x documentation.
</p>
<div align="center">
<a href="https://www.npmjs.com/package/zod-openapi"><img src="https://img.shields.io/npm/v/zod-openapi"/></a>
<a href="https://www.npmjs.com/package/zod-openapi"><img src="https://img.shields.io/npm/dm/zod-openapi"/></a>
<a href="https://nodejs.org/en/"><img src="https://img.shields.io/badge/node-%3E%3D%2018-brightgreen"/></a>
<a href="https://github.com/samchungy/zod-openapi/actions/workflows/test.yml"><img src="https://github.com/samchungy/zod-openapi/actions/workflows/test.yml/badge.svg"/></a>
<a href="https://github.com/samchungy/zod-openapi/actions/workflows/release.yml"><img src="https://github.com/samchungy/zod-openapi/actions/workflows/release.yml/badge.svg"/></a>
<a href="https://github.com/seek-oss/skuba"><img src="https://img.shields.io/badge/🤿%20skuba-powered-009DC4"/></a>
</div>
<br>

## Installation

Install via `npm`, `yarn`, or `pnpm`:

```bash
npm install zod zod-openapi
# or
yarn add zod zod-openapi
# or
pnpm install zod zod-openapi
```

## Usage

### Extending Zod

This package extends Zod by adding an `.openapi()` method. Call this at the top of your entry point(s). You can apply this extension in two ways:

#### Subpath Import

```ts
import 'zod-openapi/extend';
import { z } from 'zod';

z.string().openapi({ description: 'Hello world!', example: 'Hello world' });
```

#### Manual Extension

This method is useful if you have a specific instance of Zod or a Zod instance from another library that you want to extend.

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);

z.string().openapi({ description: 'Hello world!', example: 'hello world' });
```

### `.openapi()`

Use the `.openapi()` method to add metadata to a Zod schema. It accepts an object with the following options:

| Option            | Description                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `OpenAPI Options` | Accepts any option available for a [SchemaObject](https://swagger.io/docs/specification/data-models/data-types/).         |
| `effectType`      | Overrides the creation type for a [Zod Effect](#zod-effects).                                                             |
| `header`          | Adds metadata for [response headers](#response-headers).                                                                  |
| `param`           | Adds metadata for [request parameters](#parameters).                                                                      |
| `ref`             | Registers a schema as a reusable OpenAPI component.                                                                       |
| `refType`         | Defines the creation type for a component not explicitly referenced in the document.                                      |
| `type`            | Overrides the generated type. If provided, no metadata will be generated.                                                 |
| `unionOneOf`      | Forces a `oneOf` instead of `anyOf` for unions. See [CreateDocumentOptions](#CreateDocumentOptions) for a global setting. |

### `createDocument`

Generates an OpenAPI documentation object.

```typescript
import 'zod-openapi/extend';
import { z } from 'zod';
import { createDocument } from 'zod-openapi';

const jobId = z.string().openapi({
  description: 'A unique identifier for a job',
  example: '12345',
  ref: 'jobId',
});

const title = z.string().openapi({
  description: 'Job title',
  example: 'My job',
});

const document = createDocument({
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '1.0.0',
  },
  paths: {
    '/jobs/{jobId}': {
      put: {
        requestParams: { path: z.object({ jobId }) },
        requestBody: {
          content: {
            'application/json': { schema: z.object({ title }) },
          },
        },
        responses: {
          '200': {
            description: '200 OK',
            content: {
              'application/json': { schema: z.object({ jobId, title }) },
            },
          },
        },
      },
    },
  },
});
```

<details>
  <summary>Creates the following object:</summary>
  
  ```json
  {
    "openapi": "3.1.0",
    "info": {
      "title": "My API",
      "version": "1.0.0"
    },
    "paths": {
      "/jobs/{jobId}": {
        "put": {
          "parameters": [
            {
              "in": "path",
              "name": "jobId",
              "description": "A unique identifier for a job",
              "schema": {
                "$ref": "#/components/schemas/jobId"
              }
            }
          ],
          "requestBody": {
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "title": {
                      "type": "string",
                      "description": "Job title",
                      "example": "My job"
                    }
                  },
                  "required": ["title"]
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "200 OK",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "object",
                    "properties": {
                      "jobId": {
                        "$ref": "#/components/schemas/jobId"
                      },
                      "title": {
                        "type": "string",
                        "description": "Job title",
                        "example": "My job"
                      }
                    },
                    "required": ["jobId", "title"]
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "jobId": {
          "type": "string",
          "description": "A unique identifier for a job",
          "example": "12345"
        }
      }
    }
  }
  ```
</details>

#### CreateDocumentOptions

`createDocument` takes an optional `CreateDocumentOptions` argument which can be used to modify how the document is created.

```typescript
const document = createDocument(details, {
  defaultDateSchema: { type: 'string', format: 'date-time' }, // defaults to { type: 'string' }
  unionOneOf: true, // defaults to false. Forces all ZodUnions to output oneOf instead of anyOf. An `.openapi()` `unionOneOf` value takes precedence over this one.
  enforceDiscriminatedUnionComponents: true, // defaults to false. Throws an error if a Discriminated Union member is not registered as a component.
});
```

### `createSchema`

Creates an OpenAPI Schema Object along with any registered components. OpenAPI 3.1.0 Schema Objects are fully compatible with JSON Schema.

```typescript
import 'zod-openapi/extend';
import { z } from 'zod';
import { createSchema } from 'zod-openapi';

const jobId = z.string().openapi({
  description: 'A unique identifier for a job',
  example: '12345',
  ref: 'jobId',
});

const title = z.string().openapi({
  description: 'Job title',
  example: 'My job',
});

const job = z.object({
  jobId,
  title,
});

const { schema, components } = createSchema(job);
```

<details>
  <summary>Creates the following object:</summary>
  
  ```json
  {
    "schema": {
      "type": "object",
      "properties": {
        "jobId": {
          "$ref": "#/components/schemas/jobId"
        },
        "title": {
          "type": "string",
          "description": "Job title",
          "example": "My job"
        }
      },
      "required": ["jobId", "title"]
    },
    "components": {
      "jobId": {
        "type": "string",
        "description": "A unique identifier for a job",
        "example": "12345"
      }
    }
  }
  ```
</details>

#### CreateSchemaOptions

`createSchema` takes an optional `CreateSchemaOptions` parameter which can also take the same options as [CreateDocumentOptions](#createdocumentoptions) along with the following options:

```typescript
const { schema, components } = createSchema(job, {
  schemaType: 'input'; // This controls whether this should be rendered as a request (`input`) or response (`output`). Defaults to `output`
  openapi: '3.0.0'; // OpenAPI version to use, defaults to `'3.1.0'`
  components: { jobId: z.string() } // Additional components to use and create while rendering the schema
  componentRefPath: '#/definitions/' // Defaults to #/components/schemas/
})
```

### Request Parameters

Query, Path, Header & Cookie parameters can be created using the `requestParams` key under the `method` key as follows:

```typescript
createDocument({
  paths: {
    '/jobs/{a}': {
      put: {
        requestParams: {
          path: z.object({ a: z.string() }),
          query: z.object({ b: z.string() }),
          cookie: z.object({ cookie: z.string() }),
          header: z.object({ 'custom-header': z.string() }),
        },
      },
    },
  },
});
```

If you would like to declare parameters in a more traditional way you may also declare them using the [parameters](https://swagger.io/docs/specification/describing-parameters/) key. The definitions will then all be combined.

```ts
createDocument({
  paths: {
    '/jobs/{a}': {
      put: {
        parameters: [
          z.string().openapi({
            param: {
              name: 'job-header',
              in: 'header',
            },
          }),
        ],
      },
    },
  },
});
```

### Request Body

Where you would normally declare the [media type](https://swagger.io/docs/specification/media-types/), set the `schema` as your Zod Schema as follows.

```typescript
createDocument({
  paths: {
    '/jobs': {
      get: {
        requestBody: {
          content: {
            'application/json': { schema: z.object({ a: z.string() }) },
          },
        },
      },
    },
  },
});
```

If you wish to use OpenAPI syntax for your schemas, simply add an OpenAPI schema to the `schema` field instead.

### Responses

Similarly to the [Request Body](#request-body), simply set the `schema` as your Zod Schema as follows. You can set the response headers using the `headers` key.

```typescript
createDocument({
  paths: {
    '/jobs': {
      get: {
        responses: {
          200: {
            description: '200 OK',
            content: {
              'application/json': { schema: z.object({ a: z.string() }) },
            },
            headers: z.object({
              'header-key': z.string(),
            }),
          },
        },
      },
    },
  },
});
```

### Callbacks

```typescript
createDocument({
  paths: {
    '/jobs': {
      get: {
        callbacks: {
          onData: {
            '{$request.query.callbackUrl}/data': {
              post: {
                requestBody: {
                  content: {
                    'application/json': { schema: z.object({ a: z.string() }) },
                  },
                },
                responses: {
                  200: {
                    description: '200 OK',
                    content: {
                      'application/json': {
                        schema: z.object({ a: z.string() }),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
});
```

### Creating Components

OpenAPI allows you to define reusable [components](https://swagger.io/docs/specification/components/) and this library allows you to replicate that in two separate ways.

1. Auto registering schema
2. Manually registering schema

#### Schema

If we take the example in `createDocument` and instead create `title` as follows

##### Auto Registering Schema

```typescript
const title = z.string().openapi({
  description: 'Job title',
  example: 'My job',
  ref: 'jobTitle', // <- new field
});
```

Wherever `title` is used in schemas across the document, it will instead be created as a reference.

```json
{ "$ref": "#/components/schemas/jobTitle" }
```

`title` will then be outputted as a schema within the components section of the documentation.

```json
{
  "components": {
    "schemas": {
      "jobTitle": {
        "type": "string",
        "description": "Job title",
        "example": "My job"
      }
    }
  }
}
```

This is a great way to create less repetitive Open API documentation. There are some Open API features like [discriminator mapping](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/) which require all schemas in the union to contain a ref.

##### Manually Registering Schema

Another way to register schema instead of adding a `ref` is to add it to the components directly. This will still work in the same way as `ref`. So whenever we run into that Zod type we will replace it with a reference.

eg.

```typescript
const title = z.string().openapi({
  description: 'Job title',
  example: 'My job',
});
createDocument({
  components: {
    schemas: {
      jobTitle: title, // this will register this Zod Schema as jobTitle unless `ref` in `.openapi()` is specified on the type
    },
  },
});
```

Unfortunately, as a limitation of this library, you should attach an `.openapi()` field or `.describe()` to the schema that you are passing into the components or you will not reap the full benefits of component generation.

```ts
// ❌ Avoid this
const title = z.string();

// ✅ Recommended ways
const title = z.string().describe('Job title');
const title = z.string().openapi({
  description: 'Job title',
  example: 'My job',
});

createDocument({
  components: {
    schemas: {
      jobTitle: title,
    },
  },
});
```

Overall, I recommend utilising the auto registering components over manual registration.

#### Parameters

Query, Path, Header & Cookie parameters can be similarly registered:

```typescript
// Easy auto registration
const jobId = z.string().openapi({
  description: 'Job ID',
  example: '1234',
  param: { ref: 'jobRef' },
});

createDocument({
  paths: {
    '/jobs/{jobId}': {
      put: {
        requestParams: {
          header: z.object({
            jobId,
          }),
        },
      },
    },
  },
});

// or more verbose auto registration
const jobId = z.string().openapi({
  description: 'Job ID',
  example: '1234',
  param: { in: 'header', name: 'jobId', ref: 'jobRef' },
});

createDocument({
  paths: {
    '/jobs/{jobId}': {
      put: {
        parameters: [jobId],
      },
    },
  },
});

// or manual registeration
const otherJobId = z.string().openapi({
  description: 'Job ID',
  example: '1234',
  param: { in: 'header', name: 'jobId' },
});

createDocument({
  components: {
    parameters: {
      jobRef: jobId,
    },
  },
});
```

#### Response Headers

Response headers can be similarly registered:

```typescript
const header = z.string().openapi({
  description: 'Job ID',
  example: '1234',
  header: { ref: 'some-header' },
});

// or

const jobIdHeader = z.string().openapi({
  description: 'Job ID',
  example: '1234',
});

createDocument({
  components: {
    headers: {
      someHeaderRef: jobIdHeader,
    },
  },
});
```

#### Responses

Entire Responses can also be registered

```typescript
const response: ZodOpenApiResponseObject = {
  description: '200 OK',
  content: {
    'application/json': {
      schema: z.object({ a: z.string() }),
    },
  },
  ref: 'some-response',
};

//or

const response: ZodOpenApiResponseObject = {
  description: '200 OK',
  content: {
    'application/json': {
      schema: z.object({ a: z.string() }),
    },
  },
};

createDocument({
  components: {
    responses: {
      'some-response': response,
    },
  },
});
```

#### Callbacks

Callbacks can also be registered

```typescript
const callback: ZodOpenApiCallbackObject = {
  ref: 'some-callback'
  post: {
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': {
            schema: z.object({ a: z.string() }),
          },
        },
      },
    },
  },
};

//or

const callback: ZodOpenApiCallbackObject = {
  post: {
    responses: {
      200: {
        description: '200 OK',
        content: {
          'application/json': {
            schema: z.object({ a: z.string() }),
          },
        },
      },
    },
  },
};

createDocument({
  components: {
    callbacks: {
      'some-callback': callback,
    },
  },
});
```

### Zod Effects

`.transform()`, `.catch()`, `.default()` and `.pipe()` are complicated because they all comprise of two different types that we could generate (input & output).

We attempt to determine what type of schema to create based on the following contexts:

_Input_: Request Bodies, Request Parameters, Headers

_Output_: Responses, Response Headers

As an example:

```ts
z.object({
  a: z.string().default('a'),
});
```

In a request context, this would render the following OpenAPI schema:

```yaml
type: 'object'
properties:
  - a:
    type: 'string'
    default: 'a'
```

or the following for a response:

```yaml
type: 'object'
properties:
  - a:
    type: 'string'
    default: 'a'
required:
  - a
```

Note how the response schema created an extra `required` field. This means, if you were to register a Zod schema with `.default()` as a component and use it in both a request or response, your schema would be invalid. Zod OpenAPI keeps track of this usage and will throw an error if this occurs.

#### EffectType

```ts
z.string().transform((str) => str.trim());
```

Whilst the TypeScript compiler can understand that the result is still a `string`, unfortunately we cannot introspect this as your transform function may be far more complicated than this example. To address this, you can set the `effectType` on the schema to `same`, `input` or `output`.

`same` - This informs Zod OpenAPI to pick either the input schema or output schema to generate with because they should be the same.

```ts
z.string()
  .transform((str) => str.trim())
  .openapi({ effectType: 'same' });
```

If the transform were to drift from this, you will receive a TypeScript error:

```ts
z.string()
  .transform((str) => str.length)
  .openapi({ effectType: 'same' });
//           ~~~~~~~~~~
//           Type 'same' is not assignable to type 'CreationType | undefined'.ts(2322)
```

`input` or `output` - This tells Zod OpenAPI to pick a specific schema to create whenever we run into this schema, regardless of it is a request or response schema.

```ts
z.string()
  .transform((str) => str.length)
  .openapi({ effectType: 'input' });
```

#### Preprocess

`.preprocess()` will always return the `output` type even if we are creating an input schema. If a different input type is required you can achieve this with a `.transform()` combined with a `.pipe()` or simply declare a manual `type` in `.openapi()`.

#### Component Effects

If you are adding a ZodSchema directly to the `components` section which is not referenced anywhere in the document, additional context may be required to create either an input or output schema. You can do this by setting the `refType` field to `input` or `output` in `.openapi()`. This defaults to `output` by default.

## Supported OpenAPI Versions

Currently the following versions of OpenAPI are supported

- `3.0.0`
- `3.0.1`
- `3.0.2`
- `3.0.3`
- `3.1.0`

Setting the `openapi` field will change how the some of the components are rendered.

```ts
createDocument({
  openapi: '3.1.0',
});
```

As an example `z.string().nullable()` will be rendered differently

`3.0.0`

```json
{
  "type": "string",
  "nullable": true
}
```

`3.1.0`

```json
{
  "type": ["string", "null"]
}
```

## Supported Zod Schema

- ZodAny
- ZodArray
  - `minItems`/`maxItems` mapping for `.length()`, `.min()`, `.max()`
- ZodBigInt
  - `integer` `type` and `int64` `format` mapping
- ZodBoolean
- ZodBranded
- ZodCatch
  - Treated as ZodDefault
- ZodCustom
- ZodDate
  - `type` is mapped as `string` by default
- ZodDefault
- ZodDiscriminatedUnion
  - `discriminator` mapping when all schemas in the union are [registered](#creating-components). The discriminator must be a `ZodLiteral`, `ZodEnum` or `ZodNativeEnum` with string values. Only values wrapped in `ZodBranded`, `ZodReadOnly` and `ZodCatch` are supported.
- ZodEffects
  - `transform` support for request schemas. See [Zod Effects](#zod-effects) for how to enable response schema support
  - `pre-process` support. We assume that the input type is the same as the output type. Otherwise pipe and transform can be used instead.
  - `refine` full support
- ZodEnum
- ZodIntersection
- ZodLazy
  - The recursive schema within the ZodLazy or the ZodLazy _**must**_ be registered as a component. See [Creating Components](#creating-components) for more information.
- ZodLiteral
- ZodNativeEnum
  - supporting `string`, `number` and combined enums.
- ZodNever
- ZodNull
- ZodNullable
- ZodNumber
  - `integer` `type` mapping for `.int()`
  - `exclusiveMin`/`min`/`exclusiveMax`/`max` mapping for `.min()`, `.max()`, `lt()`, `gt()`, `.positive()`, `.negative()`, `.nonnegative()`, `.nonpositive()`.
  - `multipleOf` mapping for `.multipleOf()`
- ZodObject
  - `additionalProperties` mapping for `.catchall()`, `.strict()`
  - `allOf` mapping for `.extend()` when the base object is registered and does not have `catchall()`, `strict()` and extension does not override a field.
- ZodOptional
- ZodPipeline
  - See [Zod Effects](#zod-effects) for more information.
- ZodReadonly
- ZodRecord
- ZodSet
  - Treated as an array with `uniqueItems` (you may need to add a pre-process to convert it to a set)
- ZodString
  - `format` mapping for `.url()`, `.uuid()`, `.email()`, `.datetime()`, `.date()`, `.time()`, `.duration()`, `.ip({ version: 'v4' })`, `.ip({ version: 'v6' })`, `.cidr({ version: 'v4' })`, `.cidr({ version: 'v6' })`
  - `minLength`/`maxLength` mapping for `.length()`, `.min()`, `.max()`
  - `pattern` mapping for `.regex()`, `.startsWith()`, `.endsWith()`, `.includes()`
  - `contentEncoding` mapping for `.base64()` for OpenAPI 3.1.0+
- ZodTuple
  - `items` mapping for `.rest()`
  - `prefixItems` mapping for OpenAPI 3.1.0+
- ZodUndefined
- ZodUnion
  - By default it outputs an `anyOf` schema. Use `unionOneOf` to change this to output `oneOf` instead.
- ZodUnknown

If this library cannot determine a type for a Zod Schema, it will throw an error. To avoid this, declare a manual `type` in the `.openapi()` section of that schema.

eg.

```typescript
z.custom().openapi({ type: 'string' });
```

## Examples

See the library in use in the [examples](./examples/) folder.

- Simple - [setup](./examples/simple/createSchema.ts) | [openapi.yml](./examples/simple/openapi.yml) | [redoc documentation](https://samchungy.github.io/zod-openapi/examples/simple/redoc-static.html)

## Ecosystem

- [fastify-zod-openapi](https://github.com/samchungy/fastify-zod-openapi) - Fastify plugin for zod-openapi. This includes type provider, Zod schema validation, Zod schema serialization and Swagger UI support.

- [eslint-plugin-zod-openapi](https://github.com/samchungy/eslint-plugin-zod-openapi) - Eslint rules for zod-openapi. This includes features which can autogenerate Typescript comments for your Zod types based on your `description`, `example` and `deprecated` fields.

## Comparisons

### [@asteasolutions/zod-to-openapi](./docs/comparisons.md)

## Development

### Prerequisites

- Node.js LTS
- pnpm

```shell
pnpm
pnpm build
```

### Test

```shell
pnpm test
```

### Lint

```shell
# Fix issues
pnpm format

# Check for issues
pnpm lint
```

### Release

To release a new version

1. Create a [new GitHub Release](https://github.com/samchungy/zod-openapi/releases/new)
2. Select `🏷️ Choose a tag`, enter a version number. eg. `v1.2.0` and click `+ Create new tag: vX.X.X on publish`.
3. Click the `Generate release notes` button and adjust the description.
4. Tick the `Set as the latest release` box and click `Publish release`. This will trigger the `Release` workflow.
5. Check the `Pull Requests` tab for a PR labelled `Release vX.X.X`.
6. Click `Merge Pull Request` on that Pull Request to update master with the new package version.

To release a new beta version

1. Create a [new GitHub Release](https://github.com/samchungy/zod-openapi/releases/new)
2. Select `🏷️ Choose a tag`, enter a version number with a `-beta.X` suffix eg. `v1.2.0-beta.1` and click `+ Create new tag: vX.X.X-beta.X on publish`.
3. Click the `Generate release notes` button and adjust the description.
4. Tick the `Set as a pre-release` box and click `Publish release`. This will trigger the `Prerelease` workflow.
