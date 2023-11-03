import type { ZodTypeAny, ZodUnion } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createUnionSchema = <
  T extends readonly [ZodTypeAny, ...ZodTypeAny[]],
>(
  zodUnion: ZodUnion<T>,
  state: SchemaState,
): oas31.SchemaObject => {
  const schemas = zodUnion.options.map((option, index) =>
    createSchemaObject(option, state, [`union option ${index}`]),
  );

  if (zodUnion._def.openapi?.unionOneOf) {
    return {
      oneOf: schemas,
    };
  }

  return {
    anyOf: schemas,
  };
};
