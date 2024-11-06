import type { ZodDefault, ZodTypeAny } from 'zod';

import {
  type RefObject,
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';
import { enhanceWithMetadata } from '../metadata';

export const createDefaultSchema = <T extends ZodTypeAny>(
  zodDefault: ZodDefault<T>,
  state: SchemaState,
  previous: RefObject | undefined,
): Schema => {
  const schemaObject = createSchemaObject(zodDefault._def.innerType, state, [
    'default',
  ]);

  return enhanceWithMetadata(
    schemaObject,
    {
      default: zodDefault._def.defaultValue(),
    },
    state,
    previous,
  );
};
