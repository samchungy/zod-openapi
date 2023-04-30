import { ZodUnknown } from 'zod';

import { oas31 } from '../../openapi3-ts/dist';

export const createUnknownSchema = (
  _zodUnknown: ZodUnknown,
): oas31.SchemaObject => ({});
