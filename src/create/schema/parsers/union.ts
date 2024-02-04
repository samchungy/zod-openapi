import type { ZodTypeAny, ZodUnion } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { resolveEffect } from './transform';

export const createUnionSchema = <
  T extends readonly [ZodTypeAny, ...ZodTypeAny[]],
>(
  zodUnion: ZodUnion<T>,
  state: SchemaState,
): Schema => {
  const schemas = zodUnion.options.map((option, index) =>
    createSchemaObject(option, state, [`union option ${index}`]),
  );

  if (zodUnion._def.openapi?.unionOneOf) {
    return {
      type: 'schema',
      schema: {
        oneOf: schemas.map((s) => s.schema),
      },
      effect: resolveEffect(schemas.map((s) => s.effect)),
    };
  }

  return {
    type: 'schema',
    schema: {
      anyOf: schemas.map((s) => s.schema),
    },
    effect: resolveEffect(schemas.map((s) => s.effect)),
  };
};
