import type { ZodCatch, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import { type SchemaState, createSchemaOrRef } from '../schema';

export const createCatchSchema = (
  zodCatch: ZodCatch<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaOrRef(zodCatch._def.innerType as ZodType, state, ['catch']);
