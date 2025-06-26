<p align="center">
  <img src="zod-openapi.png" width="200px" align="center" alt="zod-openapi logo" />
  <h1 align="center">zod-openapi</h1>
</p>
<p align="center">
A TypeScript library which uses <a href="https://github.com/colinhacks/zod">Zod</a> schemas to generate OpenAPI v3.x documentation.
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

### `.meta()`

Use the `.meta()` method to add metadata to a Zod schema. It accepts an object with the following options:

| Option     | Description                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------------- |
| `id`       | Registers a schema as a reusable OpenAPI component.                                                              |
| `header`   | Adds metadata for [response headers](#response-headers).                                                         |
| `param`    | Adds metadata for [request parameters](#parameters).                                                             |
| `override` | Allows you to override the rendered OpenAPI schema. This takes either an object or a function                    |
| `outputId` | Allows you to set a different ID for the output schema. This is useful when the input and output schemas differ. |
| `unusedIO` | Allows you to set the `io` for an unused schema added to the components section. Defaults to `output`            |

### `createDocument`

Generates an OpenAPI documentation object.

```typescript
import 'zod-openapi/extend';
import { z } from 'zod';
import { createDocument } from 'zod-openapi';

const jobId = z.string().openapi({
  description: 'A unique identifier for a job',
  example: '12345',
  id: 'jobId',
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
  override: ({ jsonSchema, zodSchema }) => {
    if (jsonSchema.anyOf) {
      ctx.jsonSchema.oneOf = ctx.jsonSchema.anyOf;
      delete ctx.jsonSchema.anyOf;
    }
  },
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
  id: 'jobId',
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
  id: 'jobTitle', // <- new field
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

#### Parameters

Query, Path, Header & Cookie parameters can be similarly registered:

```typescript
// Easy auto registration
const jobId = z.string().openapi({
  description: 'Job ID',
  example: '1234',
  param: { id: 'jobRef' },
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
  param: { in: 'header', name: 'jobId', id: 'jobRef' },
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
  header: { id: 'some-header' },
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
  id: 'some-response',
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
  id: 'some-callback'
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

### Zod Types

Zod types are composed of two different parts: the input and the output. This library decides which type to create based on if it is used in a request or response context.

Input:

- Request Parameters (query, path, header, cookie)
- Request Body

Output:

- Response Body
- Response Headers

In general, you want to avoid using a registered input schema in an output context and vice versa. This is because the rendered input and output schemas of a simple Zod schema will differ, even with a simple Zod schema like `z.object()`.

```ts
const schema = z.object({
  name: z.string(),
});
```

Input:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  },
  "required": ["name"]
}
```

Output:

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    }
  },
  "required": ["name"],
  "additionalProperties": false
}
```

Unless you are strictly using `z.looseObject()`s or `z.strictObject()`s throughout your codebase you will likely run into issues where the input and output schemas differ. This library will do a best effort to check equality using a simple JSON.stringify() === JSON.stringify() check. If your registered schema contains dynamically created components, this will always fail.

If the schemas are not equal, it will automatically handle this by outputting the `output` schema with an `Output` suffix.

You can override this by setting the `outputId` field with the `.meta()` method.

```ts
const schema = z
  .object({
    name: z.string(),
  })
  .meta({ id: 'MyObject', outputId: 'MyObjectResponse' });
```

## Supported OpenAPI Versions

Currently the following versions of OpenAPI are supported

- `3.1.0`
- `3.1.1`

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
