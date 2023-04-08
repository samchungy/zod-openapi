import { oas31 } from 'openapi3-ts';
import { ZodDate, ZodTypeAny, z } from 'zod';

interface ZodOpenApiMetadata<T extends ZodTypeAny, TInferred = z.infer<T>>
  extends Omit<oas31.SchemaObject, 'example'> {
  examples?: [TInferred, ...TInferred[]];
  default?: T extends ZodDate ? string : TInferred;
  schemaRef?: string;
}

declare module 'zod' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ZodSchema<Output, Def extends ZodTypeDef, Input = Output> {
    openapi<T extends ZodTypeAny>(this: T, metadata: ZodOpenApiMetadata<T>): T;
  }

  interface ZodTypeDef {
    openapi?: ZodOpenApiMetadata<ZodTypeAny>;
  }
}

export function extendZodWithOpenApi(zod: typeof z) {
  if (typeof zod.ZodSchema.prototype.openapi !== 'undefined') {
    return;
  }

  zod.ZodSchema.prototype.openapi = function (openapi) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return new (this as any).constructor({
      ...this._def,
      openapi,
    });
  };
}
