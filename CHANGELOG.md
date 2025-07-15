# zod-openapi

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
