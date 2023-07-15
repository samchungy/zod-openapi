import type { ZodTypeAny, ZodUnion } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createUnionSchema = (
  zodUnion: ZodUnion<any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const options = zodUnion.options as ZodTypeAny[];
  const schemas = options.map((option, index) =>
    createSchemaObject(option, state, [`union option ${index}`]),
  );
  return {
    anyOf: schemas,
  };
};
