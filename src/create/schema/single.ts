import type { ZodType } from 'zod';

import type { oas30, oas31 } from '../../../dist';
import type { OpenApiVersion } from '../../openapi';
import { createSchemaComponents, getDefaultComponents } from '../components';

import { type SchemaState, createSchema as internalCreateSchema } from '.';

export interface SchemaResult {
  schema: oas30.SchemaObject | oas31.SchemaObject | oas31.ReferenceObject;
  components?:
    | Record<
        string,
        oas30.SchemaObject | oas31.SchemaObject | oas31.ReferenceObject
      >
    | undefined;
}

export interface CreateSchemaOpts {
  /**
   * The type of schema to create, defaults to 'output'
   */
  schemaType?: 'input' | 'output';
  openapi?: OpenApiVersion;
  components?: Record<string, ZodType>;
}

export const createSchema = (
  zodType: ZodType,
  opts?: CreateSchemaOpts,
): SchemaResult => {
  const components = getDefaultComponents(
    {
      schemas: opts?.components,
    },
    opts?.openapi,
  );
  const state: SchemaState = {
    components,
    type: opts?.schemaType ?? 'output',
    path: [],
    visited: new Set(),
  };

  const schema = internalCreateSchema(zodType, state, ['createSchema']);

  const schemaComponents = createSchemaComponents({}, components);

  return {
    schema,
    components: schemaComponents,
  };
};
