import type { ZodDefault, ZodTypeAny } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { enhanceWithMetadata } from './metadata';

import { type SchemaState, createSchemaOrRef } from '.';

export const createDefaultSchema = (
  zodDefault: ZodDefault<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaOrRef = createSchemaOrRef(
    zodDefault._def.innerType as ZodTypeAny,
    state,
    'default',
  );

  return enhanceWithMetadata(schemaOrRef, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    default: zodDefault._def.defaultValue(),
  });
};
