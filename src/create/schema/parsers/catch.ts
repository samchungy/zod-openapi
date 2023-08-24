import type { ZodCatch, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createCatchSchema = <T extends ZodTypeAny>(
  zodCatch: ZodCatch<T>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaObject(zodCatch._def.innerType, state, ['catch']);
