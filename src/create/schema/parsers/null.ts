import type { Schema } from '../index';

export const createNullSchema = (): Schema => ({
  type: 'schema',
  schema: {
    type: 'null',
  },
});
