import { AnyZodObject, ZodType } from 'zod';

import { OpenApiVersion } from '../openapi';
import { oas30, oas31 } from '../openapi3-ts/dist';

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
  /** Use this field to auto register this request body as a component */
  ref?: string;
}

export interface ZodOpenApiResponseObject
  extends Omit<oas31.ResponseObject & oas30.ResponseObject, 'content'> {
  content?: ZodOpenApiContentObject;
  responseHeaders?: AnyZodObject;
  /** Use this field to auto register this response object as a component */
  ref?: string;
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
  extends Omit<
    oas31.ComponentsObject & oas30.ComponentsObject,
    'schemas' | 'responses' | 'requestBodies'
  > {
  schemas?: {
    [ref: string]:
      | ZodType
      | oas31.SchemaObject
      | oas31.ReferenceObject
      | oas30.SchemaObject
      | oas30.ReferenceObject;
  };
  requestBodies?: {
    [ref: string]: ZodOpenApiRequestBodyObject;
  };
  requestParams?: ZodOpenApiParameters;
  responseHeaders?: AnyZodObject;
  responses?: {
    [ref: string]: ZodOpenApiResponseObject;
  };
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
