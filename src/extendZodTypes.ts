import type { ZodDate, ZodObject, ZodTypeAny, z } from 'zod';

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
   * Used when you are manually adding a Zod Schema to the components section. This controls whether this should be rendered as a request (`input`) or response (`output`). Defaults to `output`
   */
  refType?: CreationType;
  /**
   * Used to set the created type of an effect.
   * If this was previously set to `same` and this is throwing an error, your effect is no longer returning the same type.
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

interface ZodOpenApiMetadataDef {
  /**
   * Up to date OpenAPI metadata
   */
  openapi?: ZodOpenApiMetadata<ZodTypeAny>;
  /**
   * Used to keep track of the Zod Schema had `.openapi` called on it
   */
  current?: ZodTypeAny;
  /**
   * Used to keep track of the previous Zod Schema that had `.openapi` called on it if another `.openapi` is called.
   * This can also be present when .extend is called on an object.
   */
  previous?: ZodTypeAny;
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
    zodOpenApi?: ZodOpenApiMetadataDef;
  }

  export interface ZodObjectDef {
    extendMetadata?: ZodOpenApiExtendMetadata;
  }
}
