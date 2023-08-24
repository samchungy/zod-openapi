import type { ZodDefault, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';
import { enhanceWithMetadata } from '../metadata';

export const createDefaultSchema = <T extends ZodTypeAny>(
  zodDefault: ZodDefault<T>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaObject = createSchemaObject(zodDefault._def.innerType, state, [
    'default',
  ]);

  return enhanceWithMetadata(schemaObject, {
    default: zodDefault._def.defaultValue(),
  });
};
