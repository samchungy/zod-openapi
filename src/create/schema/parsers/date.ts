import type { ZodDate } from 'zod';

import type { Schema, SchemaState } from '..';

export const createDateSchema = (
  _zodDate: ZodDate,
  state: SchemaState,
): Schema => ({
  type: 'schema',
  schema: state.documentOptions?.defaultDateSchema ?? {
    type: 'string',
  },
});
