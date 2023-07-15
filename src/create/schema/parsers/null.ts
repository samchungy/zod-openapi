import type { ZodNull } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';

export const createNullSchema = (_zodNull: ZodNull): oas31.SchemaObject => ({
  type: 'null',
});
