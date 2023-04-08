import { oas31 } from 'openapi3-ts';
import { ZodOptional, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from './schema';

export const createOptionalSchema = (
  zodOptional: ZodOptional<any>,
): oas31.SchemaObject | oas31.ReferenceObject =>
  // Optional doesn't change OpenAPI schema
  createSchemaOrRef(zodOptional.unwrap() as ZodTypeAny);
