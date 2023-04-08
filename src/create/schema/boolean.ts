import { oas31 } from 'openapi3-ts';

export const createBooleanSchema = (): oas31.SchemaObject => ({
  type: 'boolean',
});
