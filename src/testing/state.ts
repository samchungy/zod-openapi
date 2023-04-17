import { getDefaultComponents } from '../create/components';
import { SchemaState } from '../create/schema';

export const createOutputState = (): SchemaState => ({
  components: getDefaultComponents(),
  type: 'output',
});

export const createInputState = (): SchemaState => ({
  components: getDefaultComponents(),
  type: 'input',
});

export const createOutputOpenapi3State = (): SchemaState => ({
  components: { ...getDefaultComponents(), openapi: '3.0.0' },
  type: 'output',
});
