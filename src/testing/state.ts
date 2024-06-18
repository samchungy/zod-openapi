import type { SchemaState } from '../creat./schema/index';
import { getDefaultComponents } from '../create/components';
import type { ZodOpenApiComponentsObject } from '../create/document';

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
