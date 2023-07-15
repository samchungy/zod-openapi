import type { ZodBranded, ZodType } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';
export const createBrandedSchema = (
  zodBranded: ZodBranded<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaObject(zodBranded._def.type as ZodType, state, ['brand']);
