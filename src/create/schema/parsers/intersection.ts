import type { ZodIntersection, ZodTypeAny } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema/index';

import { flattenEffects } from './transform';

export const createIntersectionSchema = <
  T extends ZodTypeAny,
  U extends ZodTypeAny,
>(
  zodIntersection: ZodIntersection<T, U>,
  state: SchemaState,
): Schema => {
  const left = createSchemaObject(zodIntersection._def.left, state, [
    'intersection left',
  ]);
  const right = createSchemaObject(zodIntersection._def.right, state, [
    'intersection right',
  ]);

  return {
    type: 'schema',
    schema: {
      allOf: [left.schema, right.schema],
    },
    effects: flattenEffects([left.effects, right.effects]),
  };
};
