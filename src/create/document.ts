import type { $ZodType, $ZodTypes } from 'zod/v4/core';

import type { OpenApiVersion } from '../openapi.js';
import type { ZodOpenApiOverride } from '../types.js';

import { createComponents, createRegistry } from './components.js';
import { createPaths } from './paths.js';

import type { oas32 } from '@zod-openapi/openapi3-ts';

export interface ZodOpenApiMediaTypeObject extends Omit<
  oas32.MediaTypeObject,
  'schema' | 'itemSchema' | 'encoding' | 'prefixEncoding' | 'itemEncoding'
> {
  schema?: $ZodType | oas32.SchemaObject | oas32.ReferenceObject;
  itemSchema?: $ZodType | oas32.SchemaObject | oas32.ReferenceObject;
  encoding?: ZodOpenApiEncodingObject;
  prefixEncoding?: ZodOpenApiEncodingPropertyObject[];
  itemEncoding?: ZodOpenApiEncodingPropertyObject;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface ZodOpenApiEncodingObject
  extends oas32.ISpecificationExtension {
  [property: string]: ZodOpenApiEncodingPropertyObject;
}

export interface ZodOpenApiEncodingPropertyObject extends Omit<
  oas32.EncodingPropertyObject,
  'headers' | 'encoding' | 'prefixEncoding' | 'itemEncoding'
> {
  headers?: ZodOpenApiHeadersObject;
  encoding?: ZodOpenApiEncodingObject;
  prefixEncoding?: ZodOpenApiEncodingPropertyObject[];
  itemEncoding?: ZodOpenApiEncodingPropertyObject;
}

export interface ZodOpenApiContentObject {
  'application/json'?: ZodOpenApiMediaTypeObject;
  [mediatype: string]: ZodOpenApiMediaTypeObject | undefined;
}

export interface ZodOpenApiRequestBodyObject extends Omit<
  oas32.RequestBodyObject,
  'content'
> {
  content: ZodOpenApiContentObject;
  /** Use this field to auto register this request body as a component */
  id?: string;
}

export type ZodOpenApiHeadersObject = ZodObjectInput | oas32.HeadersObject;

export interface ZodOpenApiResponseObject extends Omit<
  oas32.ResponseObject,
  'content' | 'headers' | 'links'
> {
  content?: ZodOpenApiContentObject;
  headers?: ZodOpenApiHeadersObject;
  links?: ZodOpenApiLinksObject;
  /** Use this field to auto register this response object as a component */
  id?: string;
}

export interface ZodOpenApiResponsesObject
  extends oas32.ISpecificationExtension {
  default?: ZodOpenApiResponseObject | oas32.ReferenceObject;
  [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]:
    | ZodOpenApiResponseObject
    | oas32.ReferenceObject;
}

export type ZodOpenApiParameters = Partial<
  Record<oas32.ParameterLocation, ZodObjectInput>
>;

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface ZodOpenApiCallbacksObject
  extends oas32.ISpecificationExtension {
  [name: string]: ZodOpenApiCallbackObject;
}

export interface ZodOpenApiCallbackObject
  extends oas32.ISpecificationExtension {
  /** Use this field to auto register this callback object as a component */
  id?: string;
  [name: string]: ZodOpenApiPathItemObject | string | undefined;
}

export interface ZodOpenApiOperationObject extends Omit<
  oas32.OperationObject,
  'requestBody' | 'responses' | 'parameters' | 'callbacks'
> {
  parameters?: Array<$ZodType | oas32.ParameterObject | oas32.ReferenceObject>;
  requestBody?: ZodOpenApiRequestBodyObject;
  requestParams?: ZodOpenApiParameters;
  responses: ZodOpenApiResponsesObject;
  callbacks?: ZodOpenApiCallbacksObject;
}

export interface ZodOpenApiPathItemObject extends Omit<
  oas32.PathItemObject,
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'options'
  | 'head'
  | 'patch'
  | 'trace'
  | 'query'
  | 'additionalOperations'
  | 'parameters'
> {
  get?: ZodOpenApiOperationObject;
  put?: ZodOpenApiOperationObject;
  post?: ZodOpenApiOperationObject;
  delete?: ZodOpenApiOperationObject;
  options?: ZodOpenApiOperationObject;
  head?: ZodOpenApiOperationObject;
  patch?: ZodOpenApiOperationObject;
  trace?: ZodOpenApiOperationObject;
  query?: ZodOpenApiOperationObject;
  additionalOperations?: Record<string, ZodOpenApiOperationObject>;
  parameters?: Array<$ZodType | oas32.ParameterObject | oas32.ReferenceObject>;
  /**
   * Used to register this path item as a component.
   */
  id?: string;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface ZodOpenApiPathsObject extends oas32.ISpecificationExtension {
  [path: string]: ZodOpenApiPathItemObject;
}

export type ZodOpenApiParameterObject =
  | $ZodType
  | oas32.ParameterObject
  | oas32.ReferenceObject;

export type ZodOpenApiHeaderObject =
  | $ZodType
  | oas32.HeaderObject
  | oas32.ReferenceObject;

export type ZodOpenApiSchemaObject =
  | $ZodType
  | oas32.SchemaObject
  | oas32.ReferenceObject;

export interface ZodOpenApiSecuritySchemeObject
  extends oas32.SecuritySchemeObject {
  /**
   * Used to register this security scheme as a component.
   */
  id?: string;
}

export interface ZodOpenApiLinkObject extends oas32.LinkObject {
  /** Use this field to auto register this link object as a component */
  id?: string;
}

export type ZodOpenApiLinksObject = Record<
  string,
  ZodOpenApiLinkObject | oas32.ReferenceObject
>;

export interface ZodOpenApiExampleObject extends oas32.ExampleObject {
  /** Use this field to auto register this example object as a component */
  id?: string;
}

export type ZodOpenApiExamplesObject = Record<
  string,
  ZodOpenApiExampleObject | oas32.ReferenceObject
>;

export interface ZodOpenApiComponentsObject extends Omit<
  oas32.ComponentsObject,
  | 'schemas'
  | 'responses'
  | 'requestBodies'
  | 'headers'
  | 'parameters'
  | 'pathItems'
  | 'callbacks'
  | 'securitySchemes'
  | 'examples'
> {
  parameters?: Record<string, ZodOpenApiParameterObject>;
  schemas?: Record<string, ZodOpenApiSchemaObject>;
  requestBodies?: Record<string, ZodOpenApiRequestBodyObject>;
  headers?: Record<string, ZodOpenApiHeaderObject>;
  responses?: Record<string, ZodOpenApiResponseObject>;
  callbacks?: Record<string, ZodOpenApiCallbackObject>;
  pathItems?: Record<string, ZodOpenApiPathItemObject>;
  securitySchemes?: Record<string, ZodOpenApiSecuritySchemeObject>;
  links?: Record<string, ZodOpenApiLinkObject>;
  examples?: Record<string, ZodOpenApiExampleObject>;
}

export type ZodOpenApiVersion = OpenApiVersion;

export interface ZodOpenApiObject extends Omit<
  oas32.OpenAPIObject,
  'openapi' | 'paths' | 'webhooks' | 'components'
> {
  openapi: ZodOpenApiVersion;
  paths?: ZodOpenApiPathsObject;
  webhooks?: ZodOpenApiPathsObject;
  components?: ZodOpenApiComponentsObject;
}

export type ZodObjectInput = $ZodType<unknown, Record<string, unknown>>;

type OverrideType = $ZodTypes['_zod']['def']['type'];

export interface CreateDocumentOptions {
  /**
   * Use this to allowlist empty schemas to be created for given types
   * - `{ [ZodType]: true}` — Allow empty schemas for input and output
   * - `{ [ZodType]: { input: true, output: true } }` — Allow empty schemas for input and output
   * - `{ [ZodType]: { input: true } }` — Allow empty schemas for input only
   * - `{ [ZodType]: { output: true } }` — Allow empty schemas for output only
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
  override?: ZodOpenApiOverride;

  /**
   * Suffix to append to the output ID of the schema.
   * This is useful to avoid conflicts with other schemas that may have the same name.
   * For example, if you have a schema named `Person`, you can set this to `Response` to get `PersonResponse`.
   * If not set, the default suffix is `Output`.
   * @default 'Output'
   */
  outputIdSuffix?: string;
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
): oas32.OpenAPIObject => {
  const { paths, webhooks, components, ...rest } = zodOpenApiObject;

  const document: oas32.OpenAPIObject = rest;

  const registry = createRegistry(components);

  const createdPaths = createPaths(paths, registry, ['paths']);
  if (createdPaths) {
    document.paths = createdPaths;
  }

  const createdWebhooks = createPaths(webhooks, registry, ['webhooks']);
  if (createdWebhooks) {
    document.webhooks = createdWebhooks;
  }

  const createdComponents = createComponents(
    registry,
    opts,
    zodOpenApiObject.openapi,
  );

  if (Object.keys(createdComponents).length > 0) {
    document.components = createdComponents;
  }

  return document;
};
