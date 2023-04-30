import { ZodBoolean } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

export const createBooleanSchema = (
  _zodBoolean: ZodBoolean,
): oas31.SchemaObject => ({
  type: 'boolean',
});
