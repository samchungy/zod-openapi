import { oas31 } from 'openapi3-ts';
import { ZodDefault, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from '.';

export const createDefaultSchema = (
  zodDefault: ZodDefault<any>,
): oas31.SchemaObject => {
  const schema = createSchemaOrRef(zodDefault._def.innerType as ZodTypeAny);

  return {
    ...schema,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    default: zodDefault._def.defaultValue(),
  };
};
