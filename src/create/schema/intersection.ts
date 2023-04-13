import { oas31 } from 'openapi3-ts';
import { ZodIntersection, ZodType } from 'zod';

import { ComponentsObject } from '../components';

import { createSchemaOrRef } from '.';

export const createIntersectionSchema = (
  zodIntersection: ZodIntersection<any, any>,
  components: ComponentsObject,
): oas31.SchemaObject | oas31.ReferenceObject => ({
  allOf: [
    createSchemaOrRef(zodIntersection._def.left as ZodType, components),
    createSchemaOrRef(zodIntersection._def.right as ZodType, components),
  ],
});
