import { ZodIntersection, ZodType } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

import { SchemaState, createSchemaOrRef } from '.';

export const createIntersectionSchema = (
  zodIntersection: ZodIntersection<any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => ({
  allOf: [
    createSchemaOrRef(zodIntersection._def.left as ZodType, state),
    createSchemaOrRef(zodIntersection._def.right as ZodType, state),
  ],
});
