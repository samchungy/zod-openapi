import z, { globalRegistry, toJSONSchema } from 'zod/v4';

import { createHash, createSchema } from './src/create/schema';
import { createOutputState } from './src/testing/state';

const nonemptyString = z.string().nonempty();
const otherNonEmptyString = z
  .string()
  .nonempty()
  .meta({ id: 'foo', description: 'bar' });

const discUnion = z.discriminatedUnion('type', [
  z.object({ type: z.enum(['A', 'E']), a: nonemptyString }),
  z.object({ type: z.literal('B'), b: nonemptyString }),
  z.object({ type: z.enum(['C', 'D']), c: otherNonEmptyString }),
]);

console.dir(createSchema(discUnion, createOutputState(), []), {
  depth: Infinity,
});

console.dir(toJSONSchema(globalRegistry), {
  depth: Infinity,
});

const glob = globalRegistry;

console.log(glob);

console.log(
  createHash({
    type: 'string',
  }),
);
