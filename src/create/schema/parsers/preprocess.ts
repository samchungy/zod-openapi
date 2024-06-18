import type { ZodEffects, ZodTypeAny, input, output } from 'zod';

import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema/index';

export const createPreprocessSchema = <
  T extends ZodTypeAny,
  Output = output<T>,
  Input = input<T>,
>(
  zodPreprocess: ZodEffects<T, Output, Input>,
  state: SchemaState,
): Schema =>
  createSchemaObject(zodPreprocess._def.schema, state, ['preprocess schema']);
