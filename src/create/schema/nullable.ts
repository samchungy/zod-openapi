import { oas31 } from 'openapi3-ts';
import { ZodNullable, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from '.';

export const createNullableSchemaObject = (
  zodNullable: ZodNullable<any>,
): oas31.SchemaObject => {
  const schemaOrReference = createSchemaOrRef(
    zodNullable.unwrap() as ZodTypeAny,
  );

  if ('$ref' in schemaOrReference) {
    return {
      allOf: [schemaOrReference, { type: 'null' }],
    };
  }

  const { type, anyOf, oneOf, allOf, ...schema } = schemaOrReference;

  if (oneOf) {
    return {
      oneOf: mapNullOf(oneOf),
      ...schema,
    };
  }

  if (allOf) {
    return {
      oneOf: [{ allOf }, { type: 'null' }],
    };
  }

  if (anyOf) {
    return {
      anyOf: mapNullOf(anyOf),
      ...schema,
    };
  }

  return {
    type: mapNullType(type),
    oneOf,
    allOf,
    anyOf,
    ...schema,
  };
};

export const mapNullType = (
  type: oas31.SchemaObject['type'],
): oas31.SchemaObject['type'] => {
  if (!type) {
    return 'null';
  }

  if (Array.isArray(type)) {
    return [...type, 'null'];
  }

  return [type, 'null'];
};

const mapNullOf = (
  ofSchema: (oas31.SchemaObject | oas31.ReferenceObject)[],
): (oas31.SchemaObject | oas31.ReferenceObject)[] => [
  ...ofSchema,
  { type: 'null' },
];
