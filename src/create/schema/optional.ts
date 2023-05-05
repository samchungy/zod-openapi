import type { ZodOptional, ZodTypeAny } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createOptionalSchema = (
  zodOptional: ZodOptional<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  // Optional doesn't change OpenAPI schema
  createSchemaOrRef(zodOptional.unwrap() as ZodTypeAny, state);
