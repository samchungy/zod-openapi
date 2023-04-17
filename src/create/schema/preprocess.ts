import { oas31 } from 'openapi3-ts';
import { ZodEffects, ZodType } from 'zod';

import { createUnknownSchema } from './unknown';

import { SchemaState, createSchemaOrRef } from '.';

export const createPreprocessSchema = (
  zodPreprocess: ZodEffects<any, any, any>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (state.type === 'output') {
    return createSchemaOrRef(zodPreprocess._def.schema as ZodType, state);
  }

  return createUnknownSchema(zodPreprocess);
};
