import { oas31 } from 'openapi3-ts';
import {
  UnknownKeysParam,
  ZodDate,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  z,
} from 'zod';

interface ZodOpenApiMetadata<T extends ZodTypeAny, TInferred = z.infer<T>>
  extends Omit<oas31.SchemaObject, 'example'> {
  examples?: [TInferred, ...TInferred[]];
  default?: T extends ZodDate ? string : TInferred;
  schemaRef?: string;
}

interface ZodOpenApiExtendMetadata {
  extends: ZodObject<any, any, any, any, any>;

  extendsRef?: string;
}

declare module 'zod' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ZodSchema<Output, Def extends ZodTypeDef, Input = Output> {
    openapi<T extends ZodTypeAny>(this: T, metadata: ZodOpenApiMetadata<T>): T;
  }

  interface ZodTypeDef {
    openapi?: ZodOpenApiMetadata<ZodTypeAny>;
  }

  export interface ZodObjectDef<
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    T extends ZodRawShape = ZodRawShape,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    UnknownKeys extends UnknownKeysParam = UnknownKeysParam,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Catchall extends ZodTypeAny = ZodTypeAny,
  > extends ZodTypeDef {
    extendMetadata?: ZodOpenApiExtendMetadata;
  }
}

export function extendZodWithOpenApi(zod: typeof z) {
  if (typeof zod.ZodSchema.prototype.openapi !== 'undefined') {
    return;
  }
  zod.ZodSchema.prototype.openapi = function (openapi) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const result = new (this as any).constructor({
      ...this._def,
      openapi,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectExtend = zod.ZodObject.prototype.extend;

  zod.ZodObject.prototype.extend = function (
    ...args: [augmentation: ZodRawShape]
  ) {
    const extendResult = zodObjectExtend.apply(this, args);
    extendResult._def.extendMetadata = {
      extends: this,
      extendsRef: extendResult._def.openapi?.schemaRef,
    };
    delete extendResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return extendResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectOmit = zod.ZodObject.prototype.omit;

  zod.ZodObject.prototype.omit = function (
    ...args: [mask: { [x: string]: true | undefined }]
  ) {
    const omitResult = zodObjectOmit.apply(this, args);
    delete omitResult._def.extendMetadata;
    delete omitResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return omitResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectPick = zod.ZodObject.prototype.pick;

  zod.ZodObject.prototype.pick = function (
    ...args: [mask: { [x: string]: true | undefined }]
  ) {
    const pickResult = zodObjectPick.apply(this, args);
    delete pickResult._def.extendMetadata;
    delete pickResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return pickResult as any;
  };
}
