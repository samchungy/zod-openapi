import type { ZodReadonly, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createReadonlySchema = (
  zodReadonly: ZodReadonly<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => // Readonly doesn't change OpenAPI schema
  createSchemaObject(zodReadonly._def.innerType as ZodTypeAny, state, [
    'readonly',
  ]);
