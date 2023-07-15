import type { ZodDefault, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';
import { enhanceWithMetadata } from '../metadata';

export const createDefaultSchema = (
  zodDefault: ZodDefault<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaObject = createSchemaObject(
    zodDefault._def.innerType as ZodTypeAny,
    state,
    ['default'],
  );

  return enhanceWithMetadata(schemaObject, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    default: zodDefault._def.defaultValue(),
  });
};
