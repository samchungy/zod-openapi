import type { Schema } from '..';

export const createNullSchema = (): Schema => ({
  type: 'schema',
  schema: {
    type: 'null',
  },
});
