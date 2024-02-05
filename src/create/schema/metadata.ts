import type { oas31 } from '../../openapi3-ts/dist';

import type { Schema } from '.';

export const enhanceWithMetadata = (
  schema: Schema,
  metadata: oas31.SchemaObject | oas31.ReferenceObject,
): Schema => {
  if (schema.type === 'ref') {
    if (Object.values(metadata).every((val) => val === undefined)) {
      return schema;
    }

    return {
      type: 'schema',
      schema: {
        allOf: [schema.schema, metadata],
      },
      effects: schema.effects,
    };
  }

  return {
    type: 'schema',
    schema: {
      ...schema.schema,
      ...metadata,
    },
    effects: schema.effects,
  };
};
