import { ZodBranded, ZodType } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

import { SchemaState, createSchemaOrRef } from '.';
export const createBrandedSchema = (
  zodBranded: ZodBranded<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaOrRef(zodBranded._def.type as ZodType, state);
