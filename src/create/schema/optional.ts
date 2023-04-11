import { oas31 } from 'openapi3-ts';
import { ZodOptional, ZodTypeAny } from 'zod';

import { Components } from '../components';

import { createSchemaOrRef } from '.';

export const createOptionalSchema = (
  zodOptional: ZodOptional<any>,
  components: Components,
): oas31.SchemaObject | oas31.ReferenceObject =>
  // Optional doesn't change OpenAPI schema
  createSchemaOrRef(zodOptional.unwrap() as ZodTypeAny, components);
