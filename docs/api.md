# 'zod-openapi/api' 📦

This guide explains the API changes in zod-openapi v5.

## 🔄 V5 Changes

### 💥 Breaking Changes

#### 📊 Schema Generation

🔄 **New approach to schema generation**

In v4, zod-openapi used a custom walker to traverse Zod schemas:

- Functions like `createMediaTypeSchema` would immediately return complete schemas
- Components were inserted into the components object at creation time

In v5, we leverage Zod's native `toJSONSchema()` method with a new approach:

- We initially return an empty reference object
- The actual schema and components are populated when `createComponents()` is called
- This enables more efficient schema generation, better deduplication, and automated lazy schema resolution

**Code comparison:**

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

> 💡 Need help migrating from v4 to v5? Please reach out with any questions!

#### 🔄 Replaced Functions

| ❌ Removed (v4)         | ✅ Replacement (v5)       |
| ----------------------- | ------------------------- |
| `createParamOrRef`      | `registry.addParameter()` |
| `createMediaTypeSchema` | `registry.addSchema()`    |
| `getZodObject`          | `unwrapZodObject`         |
| `getDefaultComponents`  | `createRegistry()`        |
