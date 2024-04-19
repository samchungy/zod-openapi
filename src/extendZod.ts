import type { ZodDate, ZodObject, ZodRawShape, ZodTypeAny, z } from 'zod';

import type { CreationType } from './create/components';
import type { oas30, oas31 } from './openapi3-ts/dist';

type SchemaObject = oas30.SchemaObject & oas31.SchemaObject;

/**
 * zod-openapi metadata
 */
interface ZodOpenApiMetadata<
  T extends ZodTypeAny,
  TInferred = z.input<T> | z.output<T>,
> extends SchemaObject {
  example?: TInferred;
  examples?: [TInferred, ...TInferred[]];
  default?: T extends ZodDate ? string : TInferred;
  /**
   * Used to set the output of a ZodUnion to be `oneOf` instead of `allOf`
   */
  unionOneOf?: boolean;
  /**
   * Used to output this Zod Schema in the components schemas section. Any usage of this Zod Schema will then be transformed into a $ref.
   */
  ref?: string;
  /**
   * Used when you are manually adding a Zod Schema to the components section. This controls whether this should be rendered as request (`input`) or response (`output`). Defaults to `output`
   */
  refType?: CreationType;
  /**
   * Used to set the created type of an effect.
   */
  effectType?:
    | CreationType
    | (z.input<T> extends z.output<T>
        ? z.output<T> extends z.input<T>
          ? 'same'
          : never
        : never);
  /**
   * Used to set metadata for a parameter, request header or cookie
   */
  param?: Partial<oas31.ParameterObject> & {
    example?: TInferred;
    examples?: Record<
      string,
      (oas31.ExampleObject & { value: TInferred }) | oas31.ReferenceObject
    >;
    /**
     * Used to output this Zod Schema in the components parameters section. Any usage of this Zod Schema will then be transformed into a $ref.
     */
    ref?: string;
  };
  /**
   * Used to set data for a response header
   */
  header?: Partial<oas31.HeaderObject & oas30.HeaderObject> & {
    /**
     * Used to output this Zod Schema in the components headers section. Any usage of this Zod Schema will then be transformed into a $ref.
     */
    ref?: string;
  };
  /**
   * Used to override the generated type. If this is provided no metadata will be generated.
   */
  type?: SchemaObject['type'];
}

interface ZodOpenApiExtendMetadata {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extends: ZodObject<any, any, any, any, any>;
}

declare module 'zod' {
  interface ZodType {
    /**
     * Add OpenAPI metadata to a Zod Type
     */
    openapi<T extends ZodTypeAny>(this: T, metadata: ZodOpenApiMetadata<T>): T;
  }

  interface ZodTypeDef {
    /**
     * OpenAPI metadata
     */
    openapi?: ZodOpenApiMetadata<ZodTypeAny>;
  }

  export interface ZodObjectDef {
    extendMetadata?: ZodOpenApiExtendMetadata;
  }
}

export function extendZodWithOpenApi(zod: typeof z) {
  if (typeof zod.ZodType.prototype.openapi !== 'undefined') {
    return;
  }
  zod.ZodType.prototype.openapi = function (openapi) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return extendResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectOmit = zod.ZodObject.prototype.omit;

  zod.ZodObject.prototype.omit = function (
    ...args: [mask: Record<string, true | undefined>]
  ) {
    const omitResult = zodObjectOmit.apply(this, args);
    delete omitResult._def.extendMetadata;
    delete omitResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return omitResult as any;
  };

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const zodObjectPick = zod.ZodObject.prototype.pick;

  zod.ZodObject.prototype.pick = function (
    ...args: [mask: Record<string, true | undefined>]
  ) {
    const pickResult = zodObjectPick.apply(this, args);
    delete pickResult._def.extendMetadata;
    delete pickResult._def.openapi;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
    return pickResult as any;
  };
}
