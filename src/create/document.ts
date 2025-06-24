import type { ZodType, ZodTypeDef } from 'zod';
import type { $ZodType } from 'zod/v4/core';

import type { OpenApiVersion } from '../openapi';
import type { oas31 } from '../openapi3-ts/dist';
import type { Override } from '../zod';

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
    'schemas' | 'responses' | 'requestBodies' | 'headers' | 'parameters'
  > {
  parameters?: Record<string, ZodOpenApiParameterObject>;
  schemas?: Record<string, ZodOpenApiSchemaObject>;
  requestBodies?: Record<string, ZodOpenApiRequestBodyObject>;
  headers?: Record<string, ZodOpenApiHeaderObject>;
  responses?: Record<string, ZodOpenApiResponseObject>;
  callbacks?: Record<string, ZodOpenApiCallbackObject>;
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

export interface CreateDocumentOptions {
  /**
   * Use to override the rendered schema
   */
  override?: Override;
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
