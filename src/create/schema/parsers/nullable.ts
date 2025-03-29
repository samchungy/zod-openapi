import type { ZodNullable, ZodTypeAny } from 'zod';

import { satisfiesVersion } from '../../../openapi';
import type { oas31 } from '../../../openapi3-ts/dist';
import type { ZodOpenApiVersion } from '../../document';
import {
  type Schema,
  type SchemaState,
  createSchemaObject,
} from '../../schema';

export const createNullableSchema = <T extends ZodTypeAny>(
  zodNullable: ZodNullable<T>,
  state: SchemaState,
): Schema => {
  const schemaObject = createSchemaObject(zodNullable.unwrap(), state, [
    'nullable',
  ]);

  if (satisfiesVersion(state.components.openapi, '3.1.0')) {
    if (schemaObject.type === 'ref' || schemaObject.schema.allOf) {
      return {
        type: 'schema',
        schema: {
          oneOf: mapNullOf([schemaObject.schema], state.components.openapi),
        },
        effects: schemaObject.effects,
      };
    }

    if (schemaObject.schema.oneOf) {
      const { oneOf, ...schema } = schemaObject.schema;
      return {
        type: 'schema',
        schema: {
          oneOf: mapNullOf(oneOf, state.components.openapi),
          ...schema,
        },
        effects: schemaObject.effects,
      };
    }

    if (schemaObject.schema.anyOf) {
      const { anyOf, ...schema } = schemaObject.schema;
      return {
        type: 'schema',
        schema: {
          anyOf: mapNullOf(anyOf, state.components.openapi),
          ...schema,
        },
        effects: schemaObject.effects,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { type, const: schemaConst, ...schema } = schemaObject.schema;

    if (schemaConst) {
      return {
        type: 'schema',
        schema: {
          type: mapNullType(type),
          enum: [schemaConst, null],
          ...schema,
        } as oas31.SchemaObject,
        effects: schemaObject.effects,
      };
    }

    return {
      type: 'schema',
      schema: {
        type: mapNullType(type),
        ...schema,
        // https://github.com/json-schema-org/json-schema-spec/issues/258
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        ...(schema.enum && { enum: [...schema.enum, null] }),
      },
      effects: schemaObject.effects,
    };
  }

  if (schemaObject.type === 'ref') {
    return {
      type: 'schema',
      schema: {
        allOf: [schemaObject.schema],
        nullable: true,
      } as oas31.SchemaObject,
      effects: schemaObject.effects,
    };
  }

  const { type, ...schema } = schemaObject.schema;

  return {
    type: 'schema',
    schema: {
      ...(type && { type }),
      nullable: true,
      ...schema,
      // https://github.com/OAI/OpenAPI-Specification/blob/main/proposals/2019-10-31-Clarify-Nullable.md#if-a-schema-specifies-nullable-true-and-enum-1-2-3-does-that-schema-allow-null-values-see-1900
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ...(schema.enum && { enum: [...schema.enum, null] }),
    } as oas31.SchemaObject,
    effects: schemaObject.effects,
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
  ofSchema: Array<oas31.SchemaObject | oas31.ReferenceObject>,
  openapi: ZodOpenApiVersion,
): Array<oas31.SchemaObject | oas31.ReferenceObject> => {
  if (satisfiesVersion(openapi, '3.1.0')) {
    return [...ofSchema, { type: 'null' }];
  }
  return [...ofSchema, { nullable: true } as oas31.SchemaObject];
};
