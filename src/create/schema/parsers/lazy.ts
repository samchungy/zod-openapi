import type { ZodLazy, ZodTypeAny } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createLazySchema = <T extends ZodTypeAny>(
  zodLazy: ZodLazy<T>,
  state: SchemaState,
): oas31.ReferenceObject | oas31.SchemaObject => {
  const innerSchema = zodLazy._def.getter();
  return createSchemaObject(innerSchema, state, ['lazy schema']);
};
