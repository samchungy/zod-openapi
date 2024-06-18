import type { Schema } from '../schema';

export const createNullSchema = (): Schema => ({
  type: 'schema',
  schema: {
    type: 'null',
  },
});
