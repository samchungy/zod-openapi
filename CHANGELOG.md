# zod-openapi

## 5.4.5

### Patch Changes

- [#558](https://github.com/samchungy/zod-openapi/pull/558) [`5f21e46`](https://github.com/samchungy/zod-openapi/commit/5f21e464e2c8f6178ffbedcc8d74e56d01ad2dca) Thanks [@samchungy](https://github.com/samchungy)! - Fix type declarations

## 5.4.4

### Patch Changes

- [#556](https://github.com/samchungy/zod-openapi/pull/556) [`2f8db8a`](https://github.com/samchungy/zod-openapi/commit/2f8db8a7b52747fdb0ba4526e77e0876ff8013ba) Thanks [@samchungy](https://github.com/samchungy)! - Fix crash when generating discriminated union schemas with Zod 4.1.13+

## 5.4.3

### Patch Changes

- [#541](https://github.com/samchungy/zod-openapi/pull/541) [`fbdc363`](https://github.com/samchungy/zod-openapi/commit/fbdc3630e3d2517b9272dd991a5b777ea2480554) Thanks [@dependabot](https://github.com/apps/dependabot)! - Resolve error TS2304: Cannot find name 'oas31_d_exports'.

## 5.4.2

### Patch Changes

- [#535](https://github.com/samchungy/zod-openapi/pull/535) [`1bdce13`](https://github.com/samchungy/zod-openapi/commit/1bdce137cbe52a2aec9b47606bd49fc977043096) Thanks [@samchungy](https://github.com/samchungy)! - Fix component generation in OpenAPI 3.0.0

## 5.4.1

### Patch Changes

- [#520](https://github.com/samchungy/zod-openapi/pull/520) [`8d08bd6`](https://github.com/samchungy/zod-openapi/commit/8d08bd6441998603c85e52c3d93eff04ce8f4664) Thanks [@GeKorm](https://github.com/GeKorm)! - Fix `zod/mini` compatibility

## 5.4.0

### Minor Changes

- [#510](https://github.com/samchungy/zod-openapi/pull/510) [`dea9dbc`](https://github.com/samchungy/zod-openapi/commit/dea9dbce89cd008e18a5bdec9c7e84903a8acd5e) Thanks [@samchungy](https://github.com/samchungy)! - Re-introduce support for OpenAPI 3.x

## 5.3.1

### Patch Changes

- [`4b88330`](https://github.com/samchungy/zod-openapi/commit/4b8833024656ba04d7cf4fe1c36635c4345586f3) Thanks [@samchungy](https://github.com/samchungy)! - Fix manual component registration

## 5.3.0

### Minor Changes

- [`c43d544`](https://github.com/samchungy/zod-openapi/commit/c43d5445e6bfaacbcbf5af6374ce783aba5c783c) Thanks [@samchungy](https://github.com/samchungy)! - Remove `zodSchemas` from meta `override`

  This should result in faster type inference when using `.meta()`.

  `zodSchemas` is still available in the `CreateDocumentOptions` `override` function.

  The mis-scoped `Override` type is now exported as `ZodOpenApiOverride` and `ZodOpenApiOverrideMeta`

### Patch Changes

- [#484](https://github.com/samchungy/zod-openapi/pull/484) [`8ae543f`](https://github.com/samchungy/zod-openapi/commit/8ae543fe95c3582553af4710a8ff7bf6540b0bca) Thanks [@samchungy](https://github.com/samchungy)! - Switch to ESM

## 5.2.0

### Minor Changes

- [#480](https://github.com/samchungy/zod-openapi/pull/480) [`5c3f98a`](https://github.com/samchungy/zod-openapi/commit/5c3f98a49a4377819b93993fb92a84510f794d28) Thanks [@samchungy](https://github.com/samchungy)! - Change `ZodUndefined` behaviour

  This restores how `z.undefined()` is rendered to pre Zod v3.25.75.

  It is now rendered as:

  ```json
  {
    "not": {}
  }
  ```

  If you want to override this behaviour you can customise this with the `override` function passed into the `createDocument` function.

  eg.

  ```ts
  import { createDocument } from 'zod-openapi';

  createDocument(
    z.object({
      name: z.undefined().optional(),
    }),
    {
      override: (ctx) => {
        if (ctx.zodSchema._zod.def.type === 'undefined') {
          // This will change the behaviour back to throwing an error
          delete ctx.jsonSchema.not;
        }
      },
    },
  );
  ```

## 5.1.1

### Patch Changes

- 779d22b: Fix ZodAny and ZodUnknown optionals

## 5.1.0

### Minor Changes

- bfc5754: Allow peer versions of zod: ^4.0.0
- bfc5754: Expose `path` in override hook

  This provides context of where the override is being applied, which can be useful when throwing errors

## 5.0.1

### Patch Changes

- d71fe72: Preserve non Zod schemas
