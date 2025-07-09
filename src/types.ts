/* eslint-disable @typescript-eslint/no-empty-object-type */
import type * as core from 'zod/v4/core';

import type { oas31 } from './openapi3-ts/dist';

type OverrideParameters = Parameters<
  NonNullable<NonNullable<Parameters<typeof core.toJSONSchema>[1]>['override']>
>[0];

export type ZodOpenApiOverrideContext = OverrideParameters & {
  io: 'input' | 'output';
};

export type Override = (ctx: ZodOpenApiOverrideContext) => void;

export interface ZodOpenApiBaseMetadata {
  /**
   * Used to set metadata for a parameter
   */
  param?: Partial<oas31.ParameterObject> & {
    /**
     * Used to output this Zod Schema in the components parameters section. Any usage of this Zod Schema will then be transformed into a $ref.
     */
    id?: string;
  };
  /**
   * Used to set metadata for a response header
   */
  header?: Partial<oas31.HeaderObject> & {
    /**
     * Used to output this Zod Schema in the components headers section. Any usage of this Zod Schema will then be transformed into a $ref.
     */
    id?: string;
  };
  /**
   * Use to override the rendered schema
   */
  override?: oas31.SchemaObject | Override;

  /**
   * For use only if this Zod Schema is manually registered in the `components` section
   * and is not used anywhere else in the document.
   * Defaults to `output` if not specified.
   */
  unusedIO?: 'input' | 'output';
  /**
   * An alternate id to use for this schema in the event a registered schema is used in both a request and response schema.
   * If not specified, the id will be simply derived as the id of the schema plus an `Output` suffix. Please note that `id` must be set.
   */
  outputId?: string;
}

export interface ZodOpenApiMetadata
  extends ZodOpenApiBaseMetadata,
    core.JSONSchemaMeta {
  examples?: unknown[];
  /**
   * @deprecated - Use `examples` instead.
   * Use of `example` is discouraged, and later versions of OpenAPI specification may remove it.
   */
  example?: unknown;
}

declare module 'zod/v4' {
  interface GlobalMeta extends ZodOpenApiMetadata {}
}
