import type { ZodDefault, ZodTypeAny } from 'zod';

import { enhanceWithMetadata } from '../metadata';
import { type Schema, type SchemaState, createSchemaObject } from '../schema';

export const createDefaultSchema = <T extends ZodTypeAny>(
  zodDefault: ZodDefault<T>,
  state: SchemaState,
): Schema => {
  const schemaObject = createSchemaObject(zodDefault._def.innerType, state, [
    'default',
  ]);

  return enhanceWithMetadata(schemaObject, {
    default: zodDefault._def.defaultValue(),
  });
};
