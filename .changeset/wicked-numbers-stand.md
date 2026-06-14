---
'zod-openapi': major
---

Add OpenAPI 3.2.0 support

**Breaking changes:**

- `createDocument` now returns `oas32.OpenAPIObject` instead of `oas31.OpenAPIObject`.

**New features:**

- Added `encoding`, `prefixEncoding`, and `itemEncoding` support to `ZodOpenApiMediaTypeObject` via the new `ZodOpenApiEncodingObject` and `ZodOpenApiEncodingPropertyObject` types.
- Added `query`, `additionalOperations`, and `parameters` support to `ZodOpenApiPathItemObject`.
