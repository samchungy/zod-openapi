import { ZodNull } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

export const createNullSchema = (_zodNull: ZodNull): oas31.SchemaObject => ({
  type: 'null',
});
