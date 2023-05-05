import type {
  UnknownKeysParam,
  ZodDate,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
  z,
} from 'zod';

import type { CreationType } from './create/components';
import type { oas30, oas31 } from './openapi3-ts/dist';

type SchemaObject = oas30.SchemaObject & oas31.SchemaObject;

interface ZodOpenApiMetadata<
  T extends ZodTypeAny,
  TInferred = z.input<T> | z.output<T>,
> extends SchemaObject {
  example?: TInferred;
  examples?: [TInferred, ...TInferred[]];
  default?: T extends ZodDate ? string : TInferred;
  /**
   * Use this field to output this Zod Schema in the components schemas section. Any usage of this Zod Schema will then be transformed into a $ref.
   */
  ref?: string;
  /**
   * Use this field when you are manually adding a Zod Schema to the components section. This controls whether this should be rendered as request (`input`) or response (`output`). Defaults to `output`
   */
  refType?: CreationType;
  /**
   * Use this field to set the created type of an effect.
   */
  effectType?: CreationType;
  param?: Partial<oas31.ParameterObject> & {
    example?: TInferred;
    examples?: {
      [param: string]:
        | (oas31.ExampleObject & { value: TInferred })
        | oas31.ReferenceObject;
    };
    /**
     * Use this field to output this Zod Schema in the components parameters section. Any usage of this Zod Schema will then be transformed into a $ref.
     */
    ref?: string;
  };
  header?: Partial<oas31.HeaderObject & oas30.HeaderObject> & {
    /**
     * Use this field to output this Zod Schema in the components headers section. Any usage of this Zod Schema will then be transformed into a $ref.
     */
    ref?: string;
  };
}

interface ZodOpenApiExtendMetadata {
  extends: ZodObject<any, any, any, any, any>;
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
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
