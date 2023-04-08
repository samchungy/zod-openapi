import { oas31 } from 'openapi3-ts';
import { ZodTypeAny, ZodUnion } from 'zod';

import { createSchemaOrRef } from './schema';

export const createUnionSchema = (
  zodUnion: ZodUnion<any>,
): oas31.SchemaObject => {
  const options = zodUnion.options as ZodTypeAny[];
  const schemas = options.map((option) => createSchemaOrRef(option));
  return {
    oneOf: schemas,
  };
};
