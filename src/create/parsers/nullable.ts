import type { ZodNullable, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../openapi';
import type { oas31 } from '../../openapi3-ts/dist';
import type { ZodOpenApiVersion } from '../document';
import { type SchemaState, createSchemaOrRef } from '../schema';

export const createNullableSchema = (
  zodNullable: ZodNullable<any>,
  state: SchemaState,
): oas31.SchemaObject => {
  const schemaOrReference = createSchemaOrRef(
    zodNullable.unwrap() as ZodTypeAny,
    state,
    ['nullable'],
  );

  if ('$ref' in schemaOrReference || schemaOrReference.allOf) {
    return {
      oneOf: mapNullOf([schemaOrReference], state.components.openapi),
    };
  }

  if (schemaOrReference.oneOf) {
    const { oneOf, ...schema } = schemaOrReference;
    return {
      oneOf: mapNullOf(oneOf, state.components.openapi),
      ...schema,
    };
  }

  if (schemaOrReference.anyOf) {
    const { anyOf, ...schema } = schemaOrReference;
    return {
      anyOf: mapNullOf(anyOf, state.components.openapi),
      ...schema,
    };
  }

  const { type, ...schema } = schemaOrReference;

  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    return {
      type: mapNullType(type),
      ...schema,
    };
  }

  return {
    type,
    nullable: true,
    ...schema,
    // https://github.com/OAI/OpenAPI-Specification/blob/main/proposals/2019-10-31-Clarify-Nullable.md#if-a-schema-specifies-nullable-true-and-enum-1-2-3-does-that-schema-allow-null-values-see-1900
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ...(schema.enum && { enum: [...schema.enum, null] }),
  } as oas31.SchemaObject;
};

const mapNullType = (
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
  openapi: ZodOpenApiVersion,
): (oas31.SchemaObject | oas31.ReferenceObject)[] => {
  if (satisfiesVersion(openapi, '3.1.0')) {
    return [...ofSchema, { type: 'null' }];
  }
  return [...ofSchema, { nullable: true } as oas31.SchemaObject];
};
