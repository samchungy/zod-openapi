import type { ZodType } from 'zod';

import type { OpenApiVersion } from '../../openapi';
import type { oas30, oas31 } from '../../openapi3-ts/dist';
import {
  type CreationType,
  createSchemaComponents,
  getDefaultComponents,
} from '../components';
import type { CreateDocumentOptions } from '../document';

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

export interface CreateSchemaOptions extends CreateDocumentOptions {
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
  /**
   * The $ref path to use for the component. Defaults to `#/components/schemas/`
   */
  componentRefPath?: string;
}

export const createSchema = (
  zodType: ZodType,
  opts?: CreateSchemaOptions,
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
    documentOptions: opts,
  };

  const schema = internalCreateSchema(zodType, state, ['createSchema']);

  const schemaComponents = createSchemaComponents({}, components);

  return {
    schema,
    components: schemaComponents,
  };
};
