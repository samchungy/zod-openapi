import type { ZodAny, ZodUnknown } from 'zod';

import type { Schema } from '..';

export const createUnknownSchema = (
  _zodUnknown: ZodUnknown | ZodAny,
): Schema => ({
  type: 'schema',
  schema: {},
});
