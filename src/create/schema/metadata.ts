import { isReferenceObject } from '../../openapi';
import type { oas31 } from '../../openapi3-ts/dist';

export const enhanceWithMetadata = (
  schemaObject: oas31.SchemaObject | oas31.ReferenceObject,
  metadata: oas31.SchemaObject | oas31.ReferenceObject,
): oas31.SchemaObject | oas31.ReferenceObject => {
  if (isReferenceObject(schemaObject)) {
    if (Object.values(metadata).every((val) => val === undefined)) {
      return schemaObject;
    }

    return {
      allOf: [schemaObject, metadata],
    };
  }

  return {
    ...schemaObject,
    ...metadata,
  };
};
