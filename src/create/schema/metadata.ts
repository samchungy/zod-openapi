import { satisfiesVersion } from '../../openapi';
import type { oas31 } from '../../openapi3-ts/dist';

import type { Schema, SchemaState } from '.';

export const enhanceWithMetadata = (
  schema: Schema,
  metadata: oas31.SchemaObject | oas31.ReferenceObject,
  state: SchemaState,
): Schema => {
  if (schema.type === 'ref') {
    const values = Object.values(metadata).filter((val) => val !== undefined);
    const length = values.length;

    if (length === 0) {
      return schema;
    }

    if (length === 1 && metadata.description) {
      if (satisfiesVersion(state.components.openapi, '3.1.0')) {
        return {
          type: 'ref',
          schema: {
            description: metadata.description,
            $ref: schema.schema.$ref,
          },
          zodType: schema.zodType,
          effects: schema.effects,
        };
      }

      return {
        type: 'schema',
        schema: {
          description: metadata.description,
          allOf: [schema.schema],
        },
        effects: schema.effects,
      };
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
