import { oas31 } from 'openapi3-ts';
import { ZodEffects, ZodType } from 'zod';

import { createSchemaOrRef } from '.';

export const createEffectsSchema = (
  zodEffects: ZodEffects<any, any, any>,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaOrRef(zodEffects._def.schema as ZodType);
