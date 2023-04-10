import { oas31 } from 'openapi3-ts';
import { ZodType, ZodTypeDef } from 'zod';

import { createSchema } from '.';

export const createSchemaWithMetadata = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const { schemaRef, ...additionalMetadata } = zodSchema._def.openapi ?? {};
  const schemaOrRef = createSchema(zodSchema);

  return enhanceWithMetadata(schemaOrRef, {
    description: zodSchema.description,
    ...additionalMetadata,
  });
};

export const enhanceWithMetadata = (
  schemaOrRef: oas31.SchemaObject | oas31.ReferenceObject,
  metadata: oas31.SchemaObject | oas31.ReferenceObject,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if ('$ref' in schemaOrRef) {
    if (Object.values(metadata).every((val) => val === undefined)) {
      return schemaOrRef;
    }

    return {
      allOf: [schemaOrRef, metadata],
    };
  }

  if (schemaOrRef.allOf) {
    const rest = schemaOrRef.allOf.slice(0, -1);
    const end = schemaOrRef.allOf.at(-1);
    return {
      ...schemaOrRef,
      allOf: [...rest, ...(end ? [enhanceWithMetadata(end, metadata)] : [])],
    };
  }

  return {
    ...schemaOrRef,
    ...metadata,
  };
};
