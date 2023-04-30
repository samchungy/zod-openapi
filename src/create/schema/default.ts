import { ZodDefault, ZodTypeAny } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

import { enhanceWithMetadata } from './metadata';

import { SchemaState, createSchemaOrRef } from '.';

export const createDefaultSchema = (
  zodDefault: ZodDefault<any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaOrRef = createSchemaOrRef(
    zodDefault._def.innerType as ZodTypeAny,
    state,
  );

  return enhanceWithMetadata(schemaOrRef, {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    default: zodDefault._def.defaultValue(),
  });
};
