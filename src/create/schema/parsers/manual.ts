import type { ZodType, ZodTypeDef } from 'zod';

import type { oas31 } from '../../../openapi3-ts/dist';
import { isZodType } from '../../../zodType';
import type { SchemaState } from '../../schema';

export const createManualTypeSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): oas31.SchemaObject => {
  if (!zodSchema._def.openapi?.type) {
    const zodType = zodSchema.constructor.name;
    if (isZodType(zodSchema, 'ZodEffects')) {
      const schemaName = `${zodType} - ${zodSchema._def.effect.type}`;
      throw new Error(
        `Unknown schema ${schemaName} at ${state.path.join(
          ' > ',
        )}. Please assign it a manual 'type', wrap it in a ZodPipeline or change the 'effectType'.`,
      );
    }
    throw new Error(
      `Unknown schema ${zodType}. Please assign it a manual 'type'.`,
    );
  }

  return {
    type: zodSchema._def.openapi.type,
  };
};
