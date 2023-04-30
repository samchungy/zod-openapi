import { ZodDate } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

export const createDateSchema = (_zodDate: ZodDate): oas31.SchemaObject => ({
  type: 'string',
});
