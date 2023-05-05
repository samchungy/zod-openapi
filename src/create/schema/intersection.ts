import type { ZodIntersection, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createIntersectionSchema = (
  zodIntersection: ZodIntersection<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => ({
  allOf: [
    createSchemaOrRef(zodIntersection._def.left as ZodType, state),
    createSchemaOrRef(zodIntersection._def.right as ZodType, state),
  ],
});
