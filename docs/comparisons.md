## Comparisons

zod-openapi was created while trying to add a feature to support auto registering schemas to ### [@asteasolutions/zod-to-openapi](https://github.com/asteasolutions/zod-to-openapi). This proved to be extra challenging given the overall structure of the library so I decided re-write the whole thing. I was a big contributor to this library and love everything it's done, however I could not go past a few issues.

1. The underlying structure of the library consists of tightly coupled classes which require you to create an awkward Registry class to create references. This would mean you would need to ship a registry class instance along with your types which makes sharing types difficult.

2. No auto registering schema. Most users do not want to think about this so having to import and call `.register()` is a nuisance.

4. When you register a schema using the registry you need to use the outputted type from the `.register()` call. You do not need to do such a thing with this library.

5. No transform support or safety. You can use a `type` to override the transform type but what happens when that transform logic changes?

6. No input/output validation with components. What happens when you register a component with a transform which technically comprises of two types in a request and a response? At the moment the zod-to-openapi library will allow you to create invalid schema.

7. No lazy/recursive schema support.

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
