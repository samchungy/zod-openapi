import type { ZodEffects, ZodTypeAny, input, output } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createRefineSchema = <
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>,
>(
  zodRefine: ZodEffects<T, Output, Input>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject =>
  createSchemaObject(zodRefine._def.schema, state, ['refine schema']);
