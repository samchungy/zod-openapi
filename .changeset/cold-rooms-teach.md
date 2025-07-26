---
'zod-openapi': minor
---

Remove `zodSchemas` from meta `override`

This should result in faster type inference when using `.meta()`.

`zodSchemas` is still available in the `CreateDocumentOptions` `override` function.

The mis-scoped `Override` type is now exported as `ZodOpenApiOverride` and `ZodOpenApiOverrideMeta`
