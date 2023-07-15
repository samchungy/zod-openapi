import type { ZodEffects, ZodType } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createPreprocessSchema = (
  zodPreprocess: ZodEffects<any, any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaObject(zodPreprocess._def.schema as ZodType, state, [
    'preprocess schema',
  ]);
