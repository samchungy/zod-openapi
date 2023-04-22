import { oas30, oas31 } from 'openapi3-ts';
import { stringify } from 'yaml';
import { AnyZodObject, ZodType } from 'zod';

import { OpenApiVersion } from '../openapi';

import { createComponents, getDefaultComponents } from './components';
import { createPaths } from './paths';

export interface ZodOpenApiMediaTypeObject
  extends Omit<oas31.MediaTypeObject & oas30.MediaTypeObject, 'schema'> {
  schema?: ZodType | oas31.SchemaObject | oas31.ReferenceObject;
}

export interface ZodOpenApiContentObject {
  'application/json'?: ZodOpenApiMediaTypeObject;
  [mediatype: string]: ZodOpenApiMediaTypeObject | undefined;
}

export interface ZodOpenApiRequestBodyObject
  extends Omit<oas31.RequestBodyObject & oas30.RequestBodyObject, 'content'> {
  content: ZodOpenApiContentObject;
}

export interface ZodOpenApiResponseObject
  extends Omit<oas31.ResponseObject & oas30.ResponseObject, 'content'> {
  content?: ZodOpenApiContentObject;
  responseHeaders?: AnyZodObject;
}

export interface ZodOpenApiResponsesObject
  extends oas31.ISpecificationExtension {
  default?:
    | ZodOpenApiResponseObject
    | oas31.ReferenceObject
    | oas30.ReferenceObject;
  [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]:
    | ZodOpenApiResponseObject
    | oas31.ReferenceObject;
}

export type ZodOpenApiParameters = {
  [type in oas31.ParameterLocation & oas30.ParameterLocation]?: AnyZodObject;
};

export interface ZodOpenApiOperationObject
  extends Omit<
    oas31.OperationObject & oas30.OperationObject,
    'requestBody' | 'responses'
  > {
  requestBody?: ZodOpenApiRequestBodyObject;
  requestParams?: ZodOpenApiParameters;
  responses: ZodOpenApiResponsesObject;
}

export interface ZodOpenApiPathItemObject
  extends Omit<
    oas31.PathItemObject & oas30.PathItemObject,
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

export interface ZodOpenApiPathsObject extends oas31.ISpecificationExtension {
  [path: string]: ZodOpenApiPathItemObject;
}

export interface ZodOpenApiComponentsObject
  extends Omit<oas31.ComponentsObject & oas30.ComponentsObject, 'schemas'> {
  schemas?: {
    [schema: string]:
      | ZodType
      | oas31.SchemaObject
      | oas31.ReferenceObject
      | oas30.SchemaObject
      | oas30.ReferenceObject;
  };
  requestParams?: ZodOpenApiParameters;
  responseHeaders?: AnyZodObject;
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

export const createDocument = (
  zodOpenApiObject: ZodOpenApiObject,
): oas31.OpenAPIObject => {
  const components = zodOpenApiObject.components ?? {};
  const defaultComponents = getDefaultComponents(
    components,
    zodOpenApiObject.openapi,
  );

  return {
    ...zodOpenApiObject,
    paths: createPaths(zodOpenApiObject.paths, defaultComponents),
    webhooks: createPaths(zodOpenApiObject.webhooks, defaultComponents),
    components: createComponents(components, defaultComponents),
  };
};

export const createDocumentJson = (
  params: ZodOpenApiObject,
  jsonOptions?: {
    replacer?: Parameters<typeof JSON.stringify>[1];
    options?: Parameters<typeof JSON.stringify>[2];
  },
): string => {
  const document = createDocument(params);
  return JSON.stringify(
    document,
    jsonOptions?.replacer,
    jsonOptions?.options ?? 2,
  );
};

export const createDocumentYaml = (
  params: ZodOpenApiObject,
  yamlOptions: {
    replacer?: Parameters<typeof stringify>[1];
    options?: Parameters<typeof stringify>[2];
  } = {},
): string => {
  const document = createDocument(params);
  return stringify(document, yamlOptions.replacer, yamlOptions.options);
};
