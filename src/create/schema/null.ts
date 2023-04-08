import { oas31 } from 'openapi3-ts';

export const createNullSchema = (): oas31.SchemaObject => ({
  type: 'null',
});
