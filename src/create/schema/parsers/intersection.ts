import type { ZodIntersection, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

import { isOptionalObjectKey } from './optional';
import { flattenEffects } from './transform';

export const createIntersectionSchema = <
  T extends ZodTypeAny,
  U extends ZodTypeAny,
>(
  zodIntersection: ZodIntersection<T, U>,
  state: SchemaState,
): Schema => {
  const left = !isOptionalObjectKey(zodIntersection._def.left)
    ? createSchemaObject(zodIntersection._def.left, state, [
        'intersection left',
      ])
    : undefined;
  const right = !isOptionalObjectKey(zodIntersection._def.right)
    ? createSchemaObject(zodIntersection._def.right, state, [
        'intersection right',
      ])
    : undefined;

  return {
    type: 'schema',
    schema: {
      allOf: [...(left ? [left.schema] : []), ...(right ? [right.schema] : [])],
    },
    effects: flattenEffects([left?.effects, right?.effects]),
  };
};
