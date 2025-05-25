import { z } from 'zod/v4';

import { createSchema } from './src/create/schema';
import { createOutputState } from './src/testing/state';

console.dir(
  createSchema(
    z.object({
      a: z.discriminatedUnion('type', [
        z
          .object({
            type: z.literal('a'),
          })
          .meta({ id: 'foo' }),
      ]),
    }),
    createOutputState(),
    [],
  ),
  {
    depth: Infinity,
  },
);
