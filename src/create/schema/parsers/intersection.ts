import type { ZodIntersection, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createIntersectionSchema = <
  T extends ZodTypeAny,
  U extends ZodTypeAny,
>(
  zodIntersection: ZodIntersection<T, U>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => ({
  allOf: [
    createSchemaObject(zodIntersection._def.left, state, ['intersection left']),
    createSchemaObject(zodIntersection._def.right, state, [
      'intersection right',
    ]),
  ],
});
