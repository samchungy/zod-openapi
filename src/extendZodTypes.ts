import type { $output } from 'zod/v4';

import type { oas31 } from './openapi3-ts/dist';

declare module 'zod/v4' {
  interface GlobalMeta extends Omit<oas31.SchemaObject, 'examples'> {
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
     * Used to set the output of a ZodUnion to be `oneOf` instead of `anyOf`
     */
    unionOneOf?: boolean;
  }
}
