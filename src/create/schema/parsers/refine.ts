import type { ZodEffects, ZodTypeAny, input, output } from 'zod';

import { type Schema, type SchemaState, createSchemaObject } from '../schema';

export const createRefineSchema = <
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>,
>(
  zodRefine: ZodEffects<T, Output, Input>,
  state: SchemaState,
): Schema =>
  createSchemaObject(zodRefine._def.schema, state, ['refine schema']);
