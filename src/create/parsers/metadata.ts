import type { oas31 } from '../../openapi3-ts/dist';

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
