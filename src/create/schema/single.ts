import type { ZodType } from 'zod';

import type { oas30, oas31 } from '../../../dist';
import type { OpenApiVersion } from '../../openapi';
import {
  type CreationType,
  createSchemaComponents,
  getDefaultComponents,
} from '../components';

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
   * This controls whether this should be rendered as a request (`input`) or response (`output`). Defaults to `output`
   */
  schemaType?: CreationType;
  /**
   * OpenAPI version to use, defaults to `'3.1.0'`
   */
  openapi?: OpenApiVersion;
  /**
   * Additional components to use and create while rendering the schema
   */
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
