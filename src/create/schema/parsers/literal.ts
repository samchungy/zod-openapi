import type { ZodLiteral } from 'zod';

import type { Schema } from '..';
import type { oas31 } from '../../../openapi3-ts/dist';

export const createLiteralSchema = (
  zodLiteral: ZodLiteral<unknown>,
): Schema => ({
  type: 'schema',
  schema: {
    type: typeof zodLiteral.value as oas31.SchemaObject['type'],
    enum: [zodLiteral._def.value],
  },
});
