import type { ZodLazy, ZodType } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';
import { createComponentSchemaRef } from '../components';

import { type SchemaState, createSchemaOrRef } from '.';

export const createLazySchema = (
  zodLazy: ZodLazy<any>,
  state: SchemaState,
): oas31.ReferenceObject | oas31.SchemaObject => {
  const innerSchema = zodLazy._def.getter() as ZodType;
  const component = state.components.schemas.get(zodLazy);
  const ref = component?.ref ?? zodLazy._def.openapi?.ref;

  if (ref && component?.type === 'complete') {
    return {
      $ref: createComponentSchemaRef(ref),
    };
  }

  if (ref && (!component || component.type === 'partial')) {
    state.components.schemas.set(zodLazy, {
      type: 'lazy',
      ref,
    });
    return createSchemaOrRef(innerSchema, state);
  }

  const innerComponent = state.components.schemas.get(zodLazy);
  const innerRef = innerComponent?.ref ?? innerSchema._def.openapi?.ref;

  if (innerRef && innerComponent?.type === 'complete') {
    return {
      $ref: createComponentSchemaRef(innerRef),
    };
  }

  if (innerRef && (!innerComponent || innerComponent.type === 'partial')) {
    state.components.schemas.set(innerSchema, {
      type: 'lazy',
      ref: innerRef,
    });
    return createSchemaOrRef(innerSchema, state);
  }

  throw new Error(
    `The ZodLazy ${JSON.stringify(
      zodLazy._def,
    )} or Schema within ZodLazy ${JSON.stringify(
      innerSchema._def,
    )} must be registered`,
  );
};
