import type { ZodBoolean } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';

export const createBooleanSchema = (
  _zodBoolean: ZodBoolean,
): oas31.SchemaObject => ({
  type: 'boolean',
});
