import type { ZodLazy, ZodType } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createLazySchema = (
  zodLazy: ZodLazy<any>,
  state: SchemaState,
): oas31.ReferenceObject | oas31.SchemaObject => {
  const innerSchema = zodLazy._def.getter() as ZodType;
  return createSchemaObject(innerSchema, state, ['lazy schema']);
};
