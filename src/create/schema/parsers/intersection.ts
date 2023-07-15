import type { ZodIntersection, ZodType } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createIntersectionSchema = (
  zodIntersection: ZodIntersection<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => ({
  allOf: [
    createSchemaObject(zodIntersection._def.left as ZodType, state, [
      'intersection left',
    ]),
    createSchemaObject(zodIntersection._def.right as ZodType, state, [
      'intersection right',
    ]),
  ],
});
