import type { ZodTypeAny, ZodUnion } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { isOptionalObjectKey } from './optional';
import { flattenEffects } from './transform';

export const createUnionSchema = <
  T extends readonly [ZodTypeAny, ...ZodTypeAny[]],
>(
  zodUnion: ZodUnion<T>,
  state: SchemaState,
): Schema => {
  const schemas = zodUnion.options.reduce<Schema[]>((acc, option, index) => {
    if (!isOptionalObjectKey(option)) {
      acc.push(createSchemaObject(option, state, [`union option ${index}`]));
    }
    return acc;
  }, []);

  if (
    zodUnion._def.zodOpenApi?.openapi?.unionOneOf ??
    state.documentOptions?.unionOneOf
  ) {
    return {
      type: 'schema',
      schema: {
        oneOf: schemas.map((s) => s.schema),
      },
      effects: flattenEffects(schemas.map((s) => s.effects)),
    };
  }

  return {
    type: 'schema',
    schema: {
      anyOf: schemas.map((s) => s.schema),
    },
    effects: flattenEffects(schemas.map((s) => s.effects)),
  };
};
