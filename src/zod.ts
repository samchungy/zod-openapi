import type { core } from 'zod/v4';
import type { $ZodType } from 'zod/v4/core';

import type { oas31 } from './openapi3-ts/dist';

export type Override = core.JSONSchemaGenerator['override'];

export type OverrideParams = NonNullable<Parameters<Override>[0]>;

export const isAnyZodType = (schema: unknown): schema is $ZodType =>
  typeof schema === 'object' && schema !== null && '_zod' in schema;

declare module 'zod/v4' {
  interface GlobalMeta {
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
     * An alternate id to use for this schema in the event the schema is used in both input and output contexts.
     * If not specified, the id will be simply derived as the id of the schema plus an `Output` suffix. Please note that `id` must be set.
     */
    outputId?: string;
  }
}
