import { satisfiesVersion } from '../../openapi';
import type { oas31 } from '../../openapi3-ts/dist';

import type { RefObject, Schema, SchemaState } from '.';

export const createDescriptionMetadata = (
  schema: RefObject,
  description: string,
  state: SchemaState,
): Schema => {
  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    return {
      type: 'ref',
      schema: {
        $ref: schema.schema.$ref,
        description,
      },
      zodType: schema.zodType,
      effects: schema.effects,
      schemaObject: schema.schemaObject,
    };
  }

  return {
    type: 'schema',
    schema: {
      description,
      allOf: [schema.schema],
    },
    effects: schema.effects,
  };
};

const isValueEqual = (value: unknown, previous: unknown): boolean => {
  if (typeof value !== typeof previous) {
    return false;
  }

  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value === previous;
  }

  if (Array.isArray(value) && Array.isArray(previous)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const sorted = [...value].sort();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const previousSorted = [...previous].sort();

    return sorted.every((v, i) => isValueEqual(v, previousSorted[i]));
  }

  if (value === null || previous === null) {
    return value === previous;
  }

  if (typeof value === 'object' && typeof previous === 'object') {
    const keys = Object.keys(value);

    return keys.every((key) =>
      isValueEqual(
        (value as Record<string, unknown>)[key],
        (previous as Record<string, unknown>)[key],
      ),
    );
  }

  return value === previous;
};

export const enhanceWithMetadata = (
  schema: Schema,
  metadata: oas31.SchemaObject | oas31.ReferenceObject,
  state: SchemaState,
  previous: RefObject | undefined,
): Schema => {
  const values = Object.entries(metadata).reduce(
    (acc, [key, value]) => {
      if (value === undefined) {
        return acc;
      }

      acc[key] = value;
      return acc;
    },
    {} as Record<string, unknown>,
  ) as oas31.SchemaObject | oas31.ReferenceObject;

  const length = Object.values(values).length;

  if (schema.type === 'ref') {
    if (length === 0) {
      return schema;
    }

    if (length === 1 && metadata.description) {
      return createDescriptionMetadata(schema, metadata.description, state);
    }

    return {
      type: 'schema',
      schema: {
        allOf: [schema.schema],
        ...metadata,
      },
      effects: schema.effects,
    };
  }

  // Calculate if we can extend the previous schema
  if (previous && schema.schema.type !== 'object') {
    const diff = Object.entries({ ...schema.schema, ...values }).reduce(
      (acc, [key, value]) => {
        if (
          previous.schemaObject &&
          isValueEqual(
            (previous.schemaObject as Record<string, unknown>)[key],
            value,
          )
        ) {
          return acc;
        }
        acc[key] = value;

        return acc;
      },
      {} as Record<string, unknown>,
    );

    const diffLength = Object.values(diff).length;

    if (diffLength === 0) {
      return {
        type: 'ref',
        schema: {
          $ref: previous.schema.$ref,
        },
        effects: schema.effects,
        schemaObject: previous.schemaObject,
        zodType: previous.zodType,
      };
    }

    if (diffLength === 1 && typeof diff.description === 'string') {
      return createDescriptionMetadata(previous, diff.description, state);
    }

    return {
      type: 'schema',
      schema: { allOf: [previous.schema], ...diff },
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
