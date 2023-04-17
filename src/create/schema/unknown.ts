import { oas31 } from 'openapi3-ts';
import { ZodEffects, ZodType, ZodTypeDef } from 'zod';

export const createUnknownSchema = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
): oas31.SchemaObject => {
  if (!zodSchema._def.openapi?.type) {
    const zodType = zodSchema.constructor.name;
    const schemaName =
      zodSchema instanceof ZodEffects
        ? `${zodType} - ${zodSchema._def.effect.type}`
        : zodType;
    throw new Error(
      `Unknown schema ${schemaName}. Please assign it a manual type`,
    );
  }

  return {
    type: zodSchema._def.openapi.type,
  };
};
