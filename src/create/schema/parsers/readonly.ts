import type { ZodReadonly, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createReadonlySchema = <T extends ZodTypeAny>(
  zodReadonly: ZodReadonly<T>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => // Readonly doesn't change OpenAPI schema
  createSchemaObject(zodReadonly._def.innerType, state, ['readonly']);
