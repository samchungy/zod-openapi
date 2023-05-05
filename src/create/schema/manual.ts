import { ZodEffects, type ZodType, type ZodTypeDef } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

export const createManualTypeSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
): oas31.SchemaObject => {
  if (!zodSchema._def.openapi?.type) {
    const zodType = zodSchema.constructor.name;
    if (zodSchema instanceof ZodEffects) {
      const schemaName = `${zodType} - ${zodSchema._def.effect.type}`;
      throw new Error(
        `Unknown schema ${schemaName}. Please assign it a manual 'type', wrap it in a ZodPipeline or change the 'effectType'.`,
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
