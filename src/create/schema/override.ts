import type { GlobalMeta, core } from 'zod/v4';

import type { CreateDocumentOptions, oas31 } from '../..';
import type { Override } from '../../types';

type ZodTypeWithMeta = core.$ZodTypes & {
  meta: () => GlobalMeta | undefined;
};

export const override: Override = (ctx) => {
  const def = ctx.zodSchema._zod.def;
  switch (def.type) {
    case 'bigint': {
      ctx.jsonSchema.type = 'integer';
      ctx.jsonSchema.format = 'int64';
      break;
    }
    case 'union': {
      if ('discriminator' in def && typeof def.discriminator === 'string') {
        ctx.jsonSchema.oneOf = ctx.jsonSchema.anyOf;
        delete ctx.jsonSchema.anyOf;

        ctx.jsonSchema.type = 'object';

        ctx.jsonSchema.discriminator = {
          propertyName: def.discriminator,
        } as oas31.DiscriminatorObject;

        const mapping: NonNullable<oas31.DiscriminatorObject['mapping']> = {};
        for (const [index, obj] of Object.entries(
          ctx.jsonSchema.oneOf as core.JSONSchema.BaseSchema[],
        )) {
          const ref = obj.$ref;

          if (!ref) {
            // redoc doesn't support discriminator values without a $ref
            delete ctx.jsonSchema.discriminator;
            return;
          }

          const discriminatorValues = (
            def.options[Number(index)] as core.$ZodObject
          )._zod.propValues?.[def.discriminator];

          if (!discriminatorValues?.size) {
            return;
          }

          for (const value of [...(discriminatorValues ?? [])]) {
            if (
              typeof value !== 'string' &&
              typeof value !== 'number' &&
              typeof value !== 'boolean'
            ) {
              return;
            }
            mapping[String(value)] = ref;
          }
        }

        (ctx.jsonSchema.discriminator as oas31.DiscriminatorObject).mapping =
          mapping;
      }

      const meta = (ctx.zodSchema as ZodTypeWithMeta).meta();

      if (typeof meta?.unionOneOf === 'boolean') {
        if (meta.unionOneOf) {
          ctx.jsonSchema.oneOf = ctx.jsonSchema.anyOf;
          delete ctx.jsonSchema.anyOf;
        }
        delete ctx.jsonSchema.unionOneOf;
      }
      break;
    }
    case 'date': {
      ctx.jsonSchema.type = 'string';
      break;
    }
    case 'literal': {
      if (def.values.includes(undefined)) {
        break;
      }
      break;
    }
  }
};

export const validate = (
  ctx: {
    zodSchema: core.$ZodTypes;
    jsonSchema: core.JSONSchema.BaseSchema;
    io: 'input' | 'output';
  },
  opts: CreateDocumentOptions,
) => {
  if (Object.keys(ctx.jsonSchema).length) {
    return;
  }

  const def = ctx.zodSchema._zod.def;

  const allowEmptySchema = opts.allowEmptySchema?.[def.type];
  if (allowEmptySchema === true || allowEmptySchema?.[ctx.io]) {
    return;
  }

  switch (def.type) {
    case 'any': {
      return;
    }
    case 'unknown': {
      return;
    }
    case 'pipe': {
      if (ctx.io === 'output') {
        // For some reason transform calls pipe and the meta ends up on the pipe instead of the transform
        throw new Error(
          'Zod transform schemas are not supported in output schemas. Please use `.overwrite()` or wrap the schema in a `.pipe()`',
        );
      }
      return;
    }
    case 'transform': {
      if (ctx.io === 'output') {
        return;
      }
      break;
    }
    case 'literal': {
      if (def.values.includes(undefined)) {
        throw new Error(
          'Zod literal schemas cannot include `undefined` as a value. Please use `z.undefined()` or `.optional()` instead.',
        );
      }
      return;
    }
  }

  throw new Error(
    `Zod schema of type \`${def.type}\` cannot be represented in OpenAPI. Please assign it metadata with \`.meta()\``,
  );
};
