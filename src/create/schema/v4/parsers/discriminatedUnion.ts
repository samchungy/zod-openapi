import type { core } from 'zod/v4';

export const getDiscriminatorValue = (
  discriminator: string,
  jsonSchema: core.JSONSchema.Schema,
): string[] | undefined => {
  if (jsonSchema.type === 'object' && jsonSchema.properties) {
    const schemaValue = jsonSchema.properties[discriminator];

    if (!schemaValue) {
      return undefined;
    }

    if (schemaValue.const && typeof schemaValue.const === 'string') {
      return [schemaValue.const];
    }

    if (schemaValue.enum?.every((v) => typeof v === 'string')) {
      return schemaValue.enum;
    }

    return undefined;
  }

  return undefined;
};
