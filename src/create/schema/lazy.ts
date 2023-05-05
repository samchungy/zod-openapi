import { ZodLazy, ZodType } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';
import { createComponentSchemaRef } from '../components';

import { SchemaState, createSchemaOrRef } from '.';

export const createLazySchema = (
  zodLazy: ZodLazy<any>,
  state: SchemaState,
): oas31.ReferenceObject | oas31.SchemaObject => {
  const component = state.components.schemas.get(zodLazy);
  const ref = component?.ref ?? zodLazy._def.openapi?.ref;
  if (!ref) {
    throw new Error(`Please register the ${JSON.stringify(zodLazy._def)} type`);
  }

  if (!component || component.type === 'partial') {
    state.components.schemas.set(zodLazy, {
      type: 'lazy',
      ref,
    });
    return createSchemaOrRef(zodLazy._def.getter() as ZodType, state);
  }

  return {
    $ref: createComponentSchemaRef(ref),
  };
};
