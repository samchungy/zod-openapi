import type { ZodCatch, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createCatchSchema = <T extends ZodTypeAny>(
  zodCatch: ZodCatch<T>,
  state: SchemaState,
): Schema => createSchemaObject(zodCatch._def.innerType, state, ['catch']);
