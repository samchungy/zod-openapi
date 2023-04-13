import { oas31 } from 'openapi3-ts';
import { ZodType, ZodTypeDef } from 'zod';

import { ComponentsObject } from '../components';

import { createSchema } from '.';

export const createSchemaWithMetadata = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  components: ComponentsObject,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const { ref, param, ...additionalMetadata } = zodSchema._def.openapi ?? {};
  const schemaOrRef = createSchema(zodSchema, components);
  const description = zodSchema.description;

  return enhanceWithMetadata(schemaOrRef, {
    ...(description && { description }),
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
