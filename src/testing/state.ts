import { getDefaultComponents } from '../create/components';
import type { ZodOpenApiComponentsObject } from '../create/document';
import type { SchemaState } from '../create/schema';

export const createOutputState = (
  componentsObject?: ZodOpenApiComponentsObject,
): SchemaState => ({
  components: getDefaultComponents(componentsObject),
  type: 'output',
  path: [],
  visited: new Set(),
});

export const createInputState = (
  componentsObject?: ZodOpenApiComponentsObject,
): SchemaState => ({
  components: getDefaultComponents(componentsObject),
  type: 'input',
  path: [],
  visited: new Set(),
});

export const createOutputOpenapi3State = (): SchemaState => ({
  components: { ...getDefaultComponents(), openapi: '3.0.0' },
  type: 'output',
  path: [],
  visited: new Set(),
});
