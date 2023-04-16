# zod-openapi

A Typescript library to create full OpenAPI 3 documentation from [Zod](https://github.com/colinhacks/zod) Types.

[![npm version](https://img.shields.io/npm/v/zod-openapi)](https://www.npmjs.com/package/zod-openapi)
[![npm downloads](https://img.shields.io/npm/dm/zod-openapi)](https://www.npmjs.com/package/zod-openapi)
[![Powered by skuba](https://img.shields.io/badge/🤿%20skuba-powered-009DC4)](https://github.com/seek-oss/skuba)

## Install

Install via npm:

```bash
npm install zod zod-openapi
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
  examples: ['12345'],
});

const title = z.string().openapi({
  description: 'Job title',
  examples: ['My job'],
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
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": {
                    "type": "string",
                    "description": "Job title",
                    "examples": ["My job"]
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
                      "examples": ["12345"]
                    },
                    "title": {
                      "type": "string",
                      "description": "Job title",
                      "examples": ["My job"]
                    }
                  },
                  "required": ["jobId", "title"]
                }
              }
            }
          }
        },
        "parameters": [
          {
            "in": "path",
            "name": "jobId",
            "schema": {
              "type": "string",
              "description": "Job ID",
              "examples": ["12345"]
            }
          }
        ]
      }
    }
  }
}
```

### `createDocumentJson`

In the background it calls `createDocument` but instead outputs it as a JSON string using `JSON.stringify`. It takes an optional options object as the second parameter which can customize how the JSON string is outputted.

```typescript
const document = createDocumentJson(
  {
    openapi: '3.1.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
  },
  { options: 2 },
);
```

### `createDocumentYaml`

In the background it calls `createDocument` but instead outputs it as a YAML string using the [yaml](https://github.com/eemeli/yaml) library. It takes an optional options object as the second parameter which can customize how the YAML string is outputted.

```typescript
const document = createDocumentYaml(
  {
    openapi: '3.1.0',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
  },
  { options: { uniqueKeys: false } },
);
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

If you would like to declare parameters using OpenAPI syntax you may also declare them using the [parameters](https://swagger.io/docs/specification/describing-parameters/) key. The definitions will then all be combined.

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

Similarly to the [Request Body](#request-body), simply set the `schema` as your Zod Schema as follows. You can set the response headers using the `responseHeaders` key.

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
            responseHeaders: z.object({
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

OpenAPI allows you to define reusable [components](https://swagger.io/docs/specification/components/) and this library allows you to replicate that in a simple way.

#### Schema

If we take the example in `createDocument` and instead create `title` as follows

```typescript
const title = z.string().openapi({
  description: 'Job title',
  examples: ['My job'],
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
        "examples": ["My job"]
      }
    }
  }
}
```

This can be an extremely powerful way to generate better Open API documentation. There are some Open API features like [discriminator mapping](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/) which require all schemas in the union to contain a ref.

To display components which are not referenced by simply add the Zod Schema to the schema components directly.

eg.

```typescript
{
  "components": {
    "schemas": {
      MyJobSchema // note: this will register this Zod Schema as MyJobSchema unless `ref` is specified on the type
    }
  }
}
```

#### Parameters

Query, Path, Header & Cookie parameters can be similarly registered:

```typescript
const jobId = z.string().openapi({
  description: 'Job ID',
  examples: ['1234'],
  param: { ref: 'jobId' },
});
```

#### Response Headers

Response headers can be similarly registered:

```typescript
const header = z.string().openapi({
  description: 'Job ID',
  examples: ['1234'],
  header: { ref: 'some-header' },
});
```

## Supported OpenAPI Versions

- '3.0.0'
- '3.0.1'
- '3.0.2'
- '3.0.3'
- '3.1.0'

## Supported Zod Schema

- ZodArray
  - `minItems`/`maxItems` mapping for `.length()`, `.min()`, `.max()`
- ZodBoolean
- ZodDate
  - `string` `type` mapping by default
- ZodDefault
- ZodDiscriminatedUnion
  - `discriminator` mapping when all schemas in the union contain a `ref`.
- ZodEffects
  - `pre-process` and `refine` support
- ZodEnum
- ZodLiteral
- ZodNativeEnum
  - supporting `string`, `number` and combined enums.
- ZodNull
- ZodNullable
- ZodNumber
  - `integer` `type` mapping for `.int()`
  - `exclusiveMin`/`min`/`exclusiveMax`/`max` mapping for `.min()`, `.max()`, `lt()`, `gt()`
- ZodObject
- ZodOptional
- ZodRecord
- ZodString
  - `format` mapping for `.url()`, `.uuid()`, `.email()`, `.datetime()`
  - `minLength`/`maxLength` mapping for `.length()`, `.min()`, `.max()`
  - `pattern` mapping for `.regex()`
- ZodTuple
  - `items` mapping for `.rest()`
- ZodUnion

If this library cannot determine a type for a Zod Schema, it will throw an error. To avoid this, declare a manual `type` in the `.openapi()` section of that schema.

eg.

```typescript
z.custom().openapi({ type: 'string' });
```

## Ecosystem

- [https://github.com/samchungy/eslint-plugin-zod-openapi](eslint-plugin-zod-openapi) - Eslint rules for zod-openapi. Includes features such as autogenerating Typescript comments for your Zod types based on your description example or examples and deprecated fields.

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

### Package

```shell
# Compile source
yarn build

# Review bundle
npm pack
```

## Credits

- [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi) - zod-openapi was created while trying to re-write the wonderful library to support auto registering schemas. However, the underlying structure of the library which consists of tightly coupled classes would not allow for this be done easily. As a result zod-openapi was born with the goal of keeping the Zod Schemas independent from the generation of the documentation.
