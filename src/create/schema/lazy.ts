import type { ZodLazy, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchemaOrRef } from '.';

export const createLazySchema = (
  zodLazy: ZodLazy<any>,
  state: SchemaState,
): oas31.ReferenceObject | oas31.SchemaObject => {
  const innerSchema = zodLazy._def.getter() as ZodType;
  if (state.lazy?.get(zodLazy)) {
    throw new Error(
      `The ZodLazy Schema ${JSON.stringify(
        zodLazy._def,
      )} or inner ZodLazy Schema ${JSON.stringify(
        innerSchema._def,
      )} must be registered`,
    );
  }
  state.lazy ??= new Map();
  state.lazy.set(zodLazy, true);

  return createSchemaOrRef(innerSchema, state);
};
