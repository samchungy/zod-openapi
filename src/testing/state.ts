import { getDefaultComponents } from '../create/components';
import type { ZodOpenApiComponentsObject } from '../create/document';
import { type SchemaState, newSchemaState } from '../create/schema';

export const createOutputState = (
  componentsObject?: ZodOpenApiComponentsObject,
): SchemaState =>
  newSchemaState({
    components: getDefaultComponents(componentsObject),
    type: 'output',
  });

export const createInputState = (
  componentsObject?: ZodOpenApiComponentsObject,
): SchemaState =>
  newSchemaState({
    components: getDefaultComponents(componentsObject),
    type: 'input',
  });

export const createOutputOpenapi3State = (): SchemaState =>
  newSchemaState({
    components: { ...getDefaultComponents(), openapi: '3.0.0' },
    type: 'output',
  });
