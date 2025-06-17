import type { $output, core } from 'zod/v4';

import type { oas31 } from './openapi3-ts/dist';

export type Override = core.JSONSchemaGenerator['override'];

export type OverrideParams = NonNullable<Parameters<Override>[0]>;

declare module 'zod/v4' {
  interface GlobalMeta {
    /**
     * Used to set metadata for a parameter
     */
    param?: Partial<oas31.ParameterObject> & {
      examples?: $output[];
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
     * Use to override the default schema
     */
    override?: Omit<oas31.SchemaObject, 'examples' | 'example'> | Override;
  }
}
