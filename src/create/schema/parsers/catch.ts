import type { ZodCatch, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';
import { enhanceWithMetadata } from '../metadata';

export const createCatchSchema = <T extends ZodTypeAny>(
  zodCatch: ZodCatch<T>,
  state: SchemaState,
): Schema => {
  const schemaObject = createSchemaObject(zodCatch._def.innerType, state, [
    'default',
  ]);

  return enhanceWithMetadata(schemaObject, {
    default: zodCatch.parse(undefined),
  });
};
