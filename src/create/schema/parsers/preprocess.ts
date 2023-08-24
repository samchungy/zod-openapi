import type { ZodEffects, ZodTypeAny, input, output } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createPreprocessSchema = <
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>,
>(
  zodPreprocess: ZodEffects<T, Output, Input>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaObject(zodPreprocess._def.schema, state, ['preprocess schema']);
