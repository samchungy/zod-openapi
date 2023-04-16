import { oas31 } from 'openapi3-ts';
import { ZodNullable, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../openapi';
import { ComponentsObject } from '../components';
import { ZodOpenApiVersion } from '../document';

import { createSchemaOrRef } from '.';

export const createNullableSchema = (
  zodNullable: ZodNullable<any>,
  components: ComponentsObject,
): oas31.SchemaObject => {
  const schemaOrReference = createSchemaOrRef(
    zodNullable.unwrap() as ZodTypeAny,
    components,
  );

  if ('$ref' in schemaOrReference || schemaOrReference.allOf) {
    return {
      oneOf: mapNullOf([schemaOrReference], components.openapi),
    };
  }

  if (schemaOrReference.oneOf) {
    const { oneOf, ...schema } = schemaOrReference;
    return {
      oneOf: mapNullOf(oneOf, components.openapi),
      ...schema,
    };
  }

  if (schemaOrReference.anyOf) {
    const { anyOf, ...schema } = schemaOrReference;
    return {
      anyOf: mapNullOf(anyOf, components.openapi),
      ...schema,
    };
  }

  const { type, ...schema } = schemaOrReference;

  if (satisfiesVersion(components.openapi, '3.1.0')) {
    return {
      type: mapNullType(type),
      ...schema,
    };
  }

  return {
    type,
    nullable: true,
    ...schema,
  };
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
  return [...ofSchema, { nullable: true }];
};
