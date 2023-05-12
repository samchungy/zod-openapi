import type { ZodType, ZodTypeDef } from 'zod';

import type { oas31 } from '../../openapi3-ts/dist';

import { type SchemaState, createSchema } from '.';

export const createSchemaWithMetadata = <
  Output = any,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output,
>(
  zodSchema: ZodType<Output, Def, Input>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const { effectType, param, header, ref, refType, ...additionalMetadata } =
    zodSchema._def.openapi ?? {};
  const schemaOrRef = createSchema(zodSchema, state);
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

  return {
    ...schemaOrRef,
    ...metadata,
  };
};
