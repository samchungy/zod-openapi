import type { ZodType, ZodTypeDef } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import type { SchemaState } from '../../schema';

export const createManualTypeSchema = <
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): oas31.SchemaObject => {
  if (!zodSchema._def.openapi?.type) {
    const schemaName = zodSchema.constructor.name;
    throw new Error(
      `Unknown schema ${schemaName} at ${state.path.join(
        ' > ',
      )}. Please assign it a manual 'type'.`,
    );
  }

  return {
    type: zodSchema._def.openapi.type,
  };
};
