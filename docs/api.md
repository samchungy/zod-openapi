# 'zod-openapi/api'

## V5 Changes

### Breaking Changes

#### Runtime Changes

In v5, you no longer need to import `'zod-openapi/extend'` or call `extendZodWithOpenApi()`. The library has been completely redesigned to eliminate the need for monkey-patching Zod or making any runtime modifications. This makes zod-openapi completely side-effect free and allows you to use it directly in your projects without any preliminary setup steps.

#### Schema Generation

In v4, zod-openapi used a custom written walker to traverse Zod schemas which allowed us to render schemas immediately when requested:

- Functions like `createMediaTypeSchema` would directly return a complete schema object
- Components would be inserted into the components object at creation time

In v5, zod-openapi uses Zod's internal toJSONSchema which means we had to change we've our approach:

- We now return an empty reference object initially
- The actual schema and components are populated when `createComponents()` is called
- This enables more efficient schema generation and deduplication and automated lazy schema resolution

**Before (v4):**

```ts
// In v4, schema is generated immediately
const schema = createMediaTypeSchema({
  schema,
  components,
  'output',
  path,
  docOpts
});
// schema is already populated here
console.log(schema); // { type: 'string' } (immediately available)
```

**After (v5):**

```ts
// In v5, first create a registry
const registry = createRegistry();

// Add your schema to the registry (returns a reference)
const schema = registry.addSchema({
  schema,
  path,
  {
    io: 'output',
    source: {
      type: 'mediaType',
    }
  }
});

console.log(schema); // {} (empty reference)

// Generate all schemas and components at once
const components = createComponents(registry, docOpts);

console.log(schema); // { type: 'string' } (now populated)
```

Please reach out if you need any help migrating from v4 to v5.

#### Other Changes

- `createParamOrRef` has been removed. Use `registry.addParameter()` instead.
- `createMediaTypeSchema` has been removed. Use `registry.addSchema()` instead.
- `getZodObject` has been removed. Use `unwrapZodObject` instead.
- `getDefaultComponents` has been removed. Use `createRegistry()` instead.
