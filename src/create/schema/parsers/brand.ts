import type { ZodBranded, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';
export const createBrandedSchema = <
  T extends ZodTypeAny,
  B extends string | number | symbol,
>(
  zodBranded: ZodBranded<T, B>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaObject(zodBranded._def.type, state, ['brand']);
