import type { ZodEffects, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createPreprocessSchema = (
  zodPreprocess: ZodEffects<any, any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaOrRef(
    zodPreprocess._def.schema as ZodType,
    state,
    'preprocess schema',
  );
