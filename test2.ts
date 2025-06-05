import Ajv from 'ajv/dist/2020';
import z from 'zod/v4';

const base = z.object({
  a: z.string().meta({ id: 'a' }),
});

const ajv = new Ajv();

const schema = z.toJSONSchema(base);

console.dir(schema, { depth: null });

ajv.validate(schema, {
  a: 'hello',
});
