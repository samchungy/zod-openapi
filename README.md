<p align="center">
  <img src="zod-openapi.svg" width="200px" align="center" alt="zod-openapi logo" />
  <h1 align="center">zod-openapi</h1>
</p>
<p align="center">
A Typescript library to create full OpenAPI 3.x documentation from <a href="https://github.com/colinhacks/zod">Zod</a> Schemas
</p>
<div align="center">
<a href="https://www.npmjs.com/package/zod-openapi"><img src="https://img.shields.io/npm/v/zod-openapi"/><a>
<a href="https://www.npmjs.com/package/zod-openapi"><img src="https://img.shields.io/npm/dm/zod-openapi"/><a>
<a href="https://nodejs.org/en/"><img src="https://img.shields.io/badge/node-%3E%3D%2016.11-brightgreen"/><a>
<a href="https://github.com/samchungy/zod-openapi/actions/workflows/test.yml"><img src="https://github.com/samchungy/zod-openapi/actions/workflows/test.yml/badge.svg"/><a>
<a href="https://github.com/samchungy/zod-openapi/actions/workflows/release.yml"><img src="https://github.com/samchungy/zod-openapi/actions/workflows/release.yml/badge.svg"/><a>
<a href="https://github.com/seek-oss/skuba"><img src="https://img.shields.io/badge/🤿%20skuba-powered-009DC4"/><a>
</div>
<br>

## Install

Install via `npm` or `yarn`:

```bash
npm install zod zod-openapi
## or
yarn add zod zod-openapi
```

## API

### `extendZodWithOpenApi`

Mutates Zod with an `.openapi()` method and extra metadata. Make a side-effectful import at the top of your entry point(s).

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);

z.string().openapi({ description: 'hello world!', example: 'hello world' });
```

### `createDocument`

Creates an OpenAPI documentation object

```typescript
import { z } from 'zod';
import { createDocument, extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);

const jobId = z.string().openapi({
  description: 'Job ID',
  example: '12345',
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

Generates the following object:

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
            "schema": {
              "type": "string",
              "description": "Job ID",
              "example": "12345"
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
                      "type": "string",
                      "description": "Job ID",
                      "example": "12345"
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
  }
}
```

## Usage

### Request Parameters

Query, Path, Header & Cookie parameters can be created using the `requestParams` key under the `method` key as follows:

```typescript
createDocument({
  paths: {
    '/jobs/:a': {
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
    '/jobs/:a': {
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

Where you would normally declare the [media type](https://swagger.io/docs/specification/media-types/), instead declare the `content` as `application/json` and set the `schema` as your Zod Schema as follows.

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
{
  "title": { "$ref": "#/components/schemas/jobTitle" }
}
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

This can be an extremely powerful way to generate better Open API documentation. There are some Open API features like [discriminator mapping](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/) which require all schemas in the union to contain a ref.

##### Manually Registering Schema

Another way to register schema instead of adding a `ref` is to add it to the components directly. This will still work in the same way as `ref`. So whenever we run into that Zod type we will replace it with a reference.

eg.

```typescript
createDocument({
  components: {
    schemas: {
      jobTitle, // this will register this Zod Schema as jobTitle unless `ref` in `.openapi()` is specified on the type
    },
  },
});
```

##### Zod Effects

`.transform()` is complicated because it technically comprises of two types (input & output). This means that we need to understand which type you are creating.

If a registered schema with a transform or pipeline is used in both a request and response schema you will receive an error because the created schema for each will be different. To override the creation type for a specific ZodEffect, add an `.openapi()` field and set the `effectType` field to `input` or `output`. This will force this library to always generate the input/output type even if we are creating a response (output) or request (input) type. You typically want to use this when your know your transform has not changed the type.

`.preprocess()` will always return the `output` type even if we are creating an input schema. If a different input type is required you can achieve this with a `.transform()` combined with a `.pipe()` or simply declare a manual `type` in `.openapi()`.

If you are adding the ZodSchema directly to the `components` section which is not referenced anywhere in the document, context may required with knowing to create an input schema or an output schema. You can do this by setting the `refType` field to `input` or `output` in `.openapi()`. This defaults to `output` by default.

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

For example in `z.string().nullable()` will be rendered differently

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

- ZodArray
  - `minItems`/`maxItems` mapping for `.length()`, `.min()`, `.max()`
- ZodBoolean
- ZodBranded
- ZodCatch
- ZodDate
  - `string` `type` mapping by default
- ZodDefault
- ZodDiscriminatedUnion
  - `discriminator` mapping when all schemas in the union contain a `ref`.
- ZodEffects
  - `transform` support for request schemas. See [Zod Effects](#zod-effects) for how to enable response schema support
  - `pre-process` support. We assume that the input type is the same as the output type. Otherwise pipe and transform can be used instead.
  - `refine` full support
- ZodEnum
- ZodLazy
- ZodLiteral
- ZodNativeEnum
  - supporting `string`, `number` and combined enums.
- ZodNull
- ZodNullable
- ZodNumber
  - `integer` `type` mapping for `.int()`
  - `exclusiveMin`/`min`/`exclusiveMax`/`max` mapping for `.min()`, `.max()`, `lt()`, `gt()`
- ZodObject
  - `additionalProperties` mapping for `.catchall()`, `.strict()`
  - `allOf` mapping for `.extend()` when the base object is registered and does not have `catchall()`, `strict()` and extension does not override a field.
- ZodOptional
- ZodPipeline
- ZodRecord
- ZodSet
  - Treated as an array with `uniqueItems`, you may need to add a pre-process)
- ZodString
  - `format` mapping for `.url()`, `.uuid()`, `.email()`, `.datetime()`
  - `minLength`/`maxLength` mapping for `.length()`, `.min()`, `.max()`
  - `pattern` mapping for `.regex()`
- ZodTuple
  - `items` mapping for `.rest()`
  - `prefixItems` mapping for OpenAPI 3.1.0+
- ZodUnion
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

- [eslint-plugin-zod-openapi](https://github.com/samchungy/eslint-plugin-zod-openapi) - Eslint rules for zod-openapi. This includes features which can autogenerate Typescript comments for your Zod types based on your `description`, `example` and `deprecated` fields.

## Credits

### [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi)

zod-openapi was created while trying to add a feature to support auto registering schemas. This proved to be extra challenging given the overall structure of the library so I decided re-write the whole thing. I was a big contributor to this library and love everything it's done, however I could not go past a few issues.

1. The underlying structure of the library consists of tightly coupled classes which require you to create an awkward Registry class to create references. This would mean you would need to ship a registry class instance along with your types which makes sharing types difficult.

2. No auto registering schema. Most users do not want to think about this so having to import and call `.register()` is a nuisance.
3. When you register a schema using the registry you need to use the outputted type from the `.register()` call. You do not need to do such a thing with this library.

4. No transform support or safety. You can use a `type` to override the transform type but what happens when that transform logic changes?

5. No input/output validation with components. What happens when you register a component with a transform which technically comprises of two types in a request and a response?

Did I really rewrite an entire library just for this? Absolutely. I believe that creating documentation and types should be as simple and as frictionless as possible.

#### Migration

1. Delete the OpenAPIRegistry and OpenAPIGenerator classes
2. Replace any `.register()` call made and replace them with `ref` in `.openapi()` or alternatively, add them directly to the components section of the schema.

```ts
const registry = new OpenAPIRegistry();

const foo = registry.register(
  'foo',
  z.string().openapi({ description: 'foo' }),
);
const bar = z.object({ foo });

// Replace with:
const foo = z.string().openapi({ ref: 'foo', description: 'foo' });
const bar = z.object({ foo });

// or
const foo = z.string().openapi({ description: 'foo' });
const bar = z.object({ foo });

const document = createDocument({
  components: {
    schemas: {
      foo,
    },
  },
});
```

3. Replace `registry.registerComponent()` with a regular OpenAPI component in the document.

```ts
const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'auth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'An auth token issued by oauth',
});
// Replace with regular component declaration

const document = createDocument({
  components: {
    // declare directly in components
    securitySchemes: {
      auth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'An auth token issued by oauth',
      },
    },
  },
});
```

4. Replace `registry.registerPath()` with a regular OpenAPI paths in the document.

```ts
const registry = new OpenAPIRegistry();

registry.registerPath({
  method: 'get',
  path: '/foo',
  request: {
    query: z.object({ a: z.string() }),
    params: z.object({ b: z.string() }),
    body: z.object({ c: z.string() }),
    headers: z.object({ d: z.string() })
  },
  responses: {},
});
// Replace with regular path declaration

const getFoo: ZodOpenApiPathItemObject = {
  get: {
    requestParams: {
      query: z.object({ a: z.string() }),
      path: z.object({ b: z.string() }), // params -> path
      header: z.object({ c: z.string() }) // headers -> header
    }, // renamed from request -> requestParams
    requestBody: z.object({c: z.string() }) // request.body -> requestBody
    responses: {},
  },
};

const document = createDocument({
  paths: {
    '/foo': getFoo,
  },
});
```

## Development

### Prerequisites

- Node.js LTS
- Yarn 1.x

```shell
yarn install
```

### Test

```shell
yarn test
```

### Lint

```shell
# Fix issues
yarn format

# Check for issues
yarn lint
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
