---
'zod-openapi': minor
---

Change `ZodUndefined` behaviour

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
