import type { ZodType, ZodTypeDef } from 'zod';

import type { Schema, SchemaState } from '../../schema';

export const createManualTypeSchema = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): Schema => {
  if (!zodSchema._def.zodOpenApi?.openapi?.type) {
    const schemaName = zodSchema.constructor.name;
    throw new Error(
      `Unknown schema ${schemaName} at ${state.path.join(
        ' > ',
      )}. Please assign it a manual 'type'.`,
    );
  }

  return {
    type: 'schema',
    schema: {
      type: zodSchema._def.zodOpenApi?.openapi.type,
    },
  };
};
