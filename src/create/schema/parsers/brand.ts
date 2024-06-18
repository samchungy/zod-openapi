import type { ZodBranded, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema/index';
export const createBrandedSchema = <
  T extends ZodTypeAny,
  B extends string | number | symbol,
>(
  zodBranded: ZodBranded<T, B>,
  state: SchemaState,
): Schema => createSchemaObject(zodBranded._def.type, state, ['brand']);
