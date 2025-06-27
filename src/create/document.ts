import type { ZodType, ZodTypeDef } from 'zod';
import type { $ZodType, $ZodTypes } from 'zod/v4/core';

import type { OpenApiVersion } from '../openapi';
import type { oas31 } from '../openapi3-ts/dist';
import type { Override } from '../types';

import { createComponents, createRegistry } from './components';
import { createPaths } from './paths';

export interface ZodOpenApiMediaTypeObject
  extends Omit<oas31.MediaTypeObject, 'schema'> {
  schema?: $ZodType | oas31.SchemaObject | oas31.ReferenceObject;
}

export interface ZodOpenApiContentObject {
  'application/json'?: ZodOpenApiMediaTypeObject;
  [mediatype: string]: ZodOpenApiMediaTypeObject | undefined;
}

export interface ZodOpenApiRequestBodyObject
  extends Omit<oas31.RequestBodyObject, 'content'> {
  content: ZodOpenApiContentObject;
  /** Use this field to auto register this request body as a component */
  id?: string;
}

export type ZodOpenApiHeadersObject = ZodObjectInput | oas31.HeadersObject;

export interface ZodOpenApiResponseObject
  extends Omit<oas31.ResponseObject, 'content' | 'headers'> {
  content?: ZodOpenApiContentObject;
  headers?: ZodOpenApiHeadersObject;
  /** Use this field to auto register this response object as a component */
  id?: string;
}

export interface ZodOpenApiResponsesObject
  extends oas31.ISpecificationExtension {
  default?: ZodOpenApiResponseObject | oas31.ReferenceObject;
  [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]:
    | ZodOpenApiResponseObject
    | oas31.ReferenceObject;
}

export type ZodOpenApiParameters = Partial<
  Record<oas31.ParameterLocation, ZodObjectInput>
>;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface ZodOpenApiCallbacksObject
  extends oas31.ISpecificationExtension {
  [name: string]: ZodOpenApiCallbackObject;
}

export interface ZodOpenApiCallbackObject
  extends oas31.ISpecificationExtension {
  /** Use this field to auto register this callback object as a component */
  id?: string;
  [name: string]: ZodOpenApiPathItemObject | string | undefined;
}

export interface ZodOpenApiOperationObject
  extends Omit<
    oas31.OperationObject,
    'requestBody' | 'responses' | 'parameters' | 'callbacks'
  > {
  parameters?: Array<$ZodType | oas31.ParameterObject | oas31.ReferenceObject>;
  requestBody?: ZodOpenApiRequestBodyObject;
  requestParams?: ZodOpenApiParameters;
  responses: ZodOpenApiResponsesObject;
  callbacks?: ZodOpenApiCallbacksObject;
}

export interface ZodOpenApiPathItemObject
  extends Omit<
    oas31.PathItemObject,
    'get' | 'put' | 'post' | 'delete' | 'options' | 'head' | 'patch' | 'trace'
  > {
  get?: ZodOpenApiOperationObject;
  put?: ZodOpenApiOperationObject;
  post?: ZodOpenApiOperationObject;
  delete?: ZodOpenApiOperationObject;
  options?: ZodOpenApiOperationObject;
  head?: ZodOpenApiOperationObject;
  patch?: ZodOpenApiOperationObject;
  trace?: ZodOpenApiOperationObject;
  /**
   * Used to register this path item as a component.
   */
  id?: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface ZodOpenApiPathsObject extends oas31.ISpecificationExtension {
  [path: string]: ZodOpenApiPathItemObject;
}

export type ZodOpenApiParameterObject =
  | $ZodType
  | oas31.ParameterObject
  | oas31.ReferenceObject;

export type ZodOpenApiHeaderObject =
  | $ZodType
  | oas31.HeaderObject
  | oas31.ReferenceObject;

export type ZodOpenApiSchemaObject =
  | $ZodType
  | oas31.SchemaObject
  | oas31.ReferenceObject;

export type ZodOpenApiRequestBody =
  | $ZodType
  | oas31.RequestBodyObject
  | oas31.ReferenceObject;

export interface ZodOpenApiComponentsObject
  extends Omit<
    oas31.ComponentsObject,
    | 'schemas'
    | 'responses'
    | 'requestBodies'
    | 'headers'
    | 'parameters'
    | 'pathItems'
    | 'callbacks'
  > {
  parameters?: Record<string, ZodOpenApiParameterObject>;
  schemas?: Record<string, ZodOpenApiSchemaObject>;
  requestBodies?: Record<string, ZodOpenApiRequestBodyObject>;
  headers?: Record<string, ZodOpenApiHeaderObject>;
  responses?: Record<string, ZodOpenApiResponseObject>;
  callbacks?: Record<string, ZodOpenApiCallbackObject>;
  pathItems?: Record<string, ZodOpenApiPathItemObject>;
}

export type ZodOpenApiVersion = OpenApiVersion;

export interface ZodOpenApiObject
  extends Omit<
    oas31.OpenAPIObject,
    'openapi' | 'paths' | 'webhooks' | 'components'
  > {
  openapi: ZodOpenApiVersion;
  paths?: ZodOpenApiPathsObject;
  webhooks?: ZodOpenApiPathsObject;
  components?: ZodOpenApiComponentsObject;
}

export type ZodObjectInputType<
  Output = unknown,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Record<string, unknown>,
> = ZodType<Output, Def, Input>;

export type ZodObjectInput = $ZodType<unknown, Record<string, unknown>>;

type OverrideType = $ZodTypes['_zod']['def']['type'];

export interface CreateDocumentOptions {
  /**
   * Use this to allowlist empty schemas to be created for given types
   * - `true` — Allow empty schemas for input and output
   * - `{ input: true, output: true }` — Allow empty schemas for input and output
   * - `{ input: true }` — Allow empty schemas for input only
   * - `{ output: true }` — Allow empty schemas for output only
   */
  allowEmptySchema?: Partial<
    Record<
      OverrideType,
      | true
      | Partial<{
          input: true;
          output: true;
        }>
    >
  >;

  /**
   * Use to override the rendered schema
   * - `{ type: 'string' }` — Override the schema type to be a string using an object
   * - `(ctx) => { ctx.jsonSchema.type = 'string'; }` — Override the schema type to be a string using a function
   */
  override?: Override;
  /**
   * How to handle reused schemas.
   * - `"ref"` — Reused schemas will be rendered as references
   * - `"inline"` — Default. Reused schemas will be inlined into the document
   */
  reused?: 'ref' | 'inline';
  /** How to handle cycles.
   * - `"ref"` — Default. Cycles will be broken using $defs
   * - `"throw"` — Cycles will throw an error if encountered */
  cycles?: 'ref' | 'throw';
}

export const createDocument = (
  zodOpenApiObject: ZodOpenApiObject,
  opts: CreateDocumentOptions = {},
): oas31.OpenAPIObject => {
  const { paths, webhooks, components, ...rest } = zodOpenApiObject;

  const document: oas31.OpenAPIObject = rest;

  const registry = createRegistry(components);

  const createdPaths = createPaths(paths, registry, ['paths']);
  if (createdPaths) {
    document.paths = createdPaths;
  }

  const createdWebhooks = createPaths(webhooks, registry, ['webhooks']);
  if (createdWebhooks) {
    document.webhooks = createdWebhooks;
  }

  const createdComponents = createComponents(registry, opts);

  if (Object.keys(createdComponents).length > 0) {
    document.components = createdComponents;
  }

  return document;
};
