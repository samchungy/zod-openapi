import { oas31 } from 'openapi3-ts';
import { ZodDefault, ZodTypeAny } from 'zod';

import { enhanceWithMetadata } from './metadata';

import { createSchemaOrRef } from '.';

export const createDefaultSchema = (
  zodDefault: ZodDefault<any>,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaOrRef = createSchemaOrRef(
    zodDefault._def.innerType as ZodTypeAny,
  );

  return enhanceWithMetadata(schemaOrRef, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    default: zodDefault._def.defaultValue(),
  });
};
