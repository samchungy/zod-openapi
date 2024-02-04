import type { ZodReadonly, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createReadonlySchema = <T extends ZodTypeAny>(
  zodReadonly: ZodReadonly<T>,
  state: SchemaState,
): Schema => // Readonly doesn't change OpenAPI schema
  createSchemaObject(zodReadonly._def.innerType, state, ['readonly']);
