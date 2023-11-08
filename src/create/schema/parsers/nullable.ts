import type { ZodNullable, ZodTypeAny } from 'zod';

import { isReferenceObject, satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist';
import type { ZodOpenApiVersion } from '../../document';
import { type SchemaState, createSchemaObject } from '../../schema';

export const createNullableSchema = <T extends ZodTypeAny>(
  zodNullable: ZodNullable<T>,
  state: SchemaState,
): oas31.SchemaObject | oas31.ReferenceObject => {
  const schemaObject = createSchemaObject(zodNullable.unwrap(), state, [
    'nullable',
  ]);

  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    if (isReferenceObject(schemaObject) || schemaObject.allOf) {
      return {
        oneOf: mapNullOf([schemaObject], state.components.openapi),
      };
    }

    if (schemaObject.oneOf) {
      const { oneOf, ...schema } = schemaObject;
      return {
        oneOf: mapNullOf(oneOf, state.components.openapi),
        ...schema,
      };
    }

    if (schemaObject.anyOf) {
      const { anyOf, ...schema } = schemaObject;
      return {
        anyOf: mapNullOf(anyOf, state.components.openapi),
        ...schema,
      };
    }

    const { type, ...schema } = schemaObject;

    return {
      type: mapNullType(type),
      ...schema,
    };
  }

  if (isReferenceObject(schemaObject)) {
    return {
      allOf: [schemaObject],
      nullable: true,
    } as oas31.SchemaObject;
  }

  const { type, ...schema } = schemaObject;

  return {
    ...(type && { type }),
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
  ofSchema: Array<oas31.SchemaObject | oas31.ReferenceObject>,
  openapi: ZodOpenApiVersion,
): Array<oas31.SchemaObject | oas31.ReferenceObject> => {
  if (satisfiesVersion(openapi, '3.1.0')) {
    return [...ofSchema, { type: 'null' }];
  }
  return [...ofSchema, { nullable: true } as oas31.SchemaObject];
};
