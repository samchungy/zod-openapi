import type { ZodLazy, ZodTypeAny } from 'zod';

import { type Schema, type SchemaState, createSchemaObject } from '../schema';

export const createLazySchema = <T extends ZodTypeAny>(
  zodLazy: ZodLazy<T>,
  state: SchemaState,
): Schema => {
  const innerSchema = zodLazy._def.getter();
  return createSchemaObject(innerSchema, state, ['lazy schema']);
};
