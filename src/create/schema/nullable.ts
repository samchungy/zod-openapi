import { oas31 } from 'openapi3-ts';
import { ZodNullable, ZodTypeAny } from 'zod';

import { createSchemaOrRef } from '.';

export const createNullableSchema = (
  zodNullable: ZodNullable<any>,
): oas31.SchemaObject => {
  const schemaOrReference = createSchemaOrRef(
    zodNullable.unwrap() as ZodTypeAny,
  );

  if ('$ref' in schemaOrReference) {
    return {
      oneOf: mapNullOf([schemaOrReference]),
    };
  }

  if (schemaOrReference.oneOf) {
    const { oneOf, ...schema } = schemaOrReference;
    return {
      oneOf: mapNullOf(oneOf),
      ...schema,
    };
  }

  if (schemaOrReference.allOf) {
    return {
      oneOf: [schemaOrReference, { type: 'null' }],
    };
  }

  if (schemaOrReference.anyOf) {
    const { anyOf, ...schema } = schemaOrReference;
    return {
      anyOf: mapNullOf(anyOf),
      ...schema,
    };
  }

  const { type, ...schema } = schemaOrReference;

  return {
    type: mapNullType(type),
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
