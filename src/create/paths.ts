import { oas31 } from 'openapi3-ts';

import { isISpecificationExtension } from '../specificationExtension';

import { ComponentsObject } from './components';
import { createContent } from './content';
import {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
  ZodOpenApiRequestBodyObject,
} from './document';
import { createParametersObject } from './parameters';
import { createResponses } from './responses';

const createRequestBody = (
  requestBodyObject: ZodOpenApiRequestBodyObject | undefined,
  components: ComponentsObject,
): oas31.RequestBodyObject | undefined => {
  if (!requestBodyObject) {
    return undefined;
  }
  return {
    ...requestBodyObject,
    content: createContent(requestBodyObject.content, components),
  };
};

const createOperation = (
  operationObject: ZodOpenApiOperationObject | undefined,
  components: ComponentsObject,
): oas31.OperationObject | undefined => {
  if (!operationObject) {
    return undefined;
  }

  const { requestParams, ...rest } = operationObject;

  const parameters = createParametersObject(operationObject, components);
  return {
    ...rest,
    parameters,
    requestBody: createRequestBody(operationObject.requestBody, components),
    responses: createResponses(operationObject.responses, components),
  };
};

export const createPathItem = (
  pathObject: ZodOpenApiPathItemObject,
  components: ComponentsObject,
): oas31.PathItemObject => ({
  ...pathObject,
  get: createOperation(pathObject.get, components),
  put: createOperation(pathObject.put, components),
  post: createOperation(pathObject.post, components),
  delete: createOperation(pathObject.delete, components),
  options: createOperation(pathObject.options, components),
  head: createOperation(pathObject.head, components),
  patch: createOperation(pathObject.patch, components),
  trace: createOperation(pathObject.trace, components),
});

export const createPaths = (
  pathsObject: ZodOpenApiPathsObject | undefined,
  components: ComponentsObject,
): oas31.PathsObject | undefined => {
  if (!pathsObject) {
    return undefined;
  }

  return Object.entries(pathsObject).reduce<oas31.PathsObject>(
    (acc, [path, pathItemObject]): oas31.PathsObject => {
      if (isISpecificationExtension(path)) {
        acc[path] = pathItemObject;
        return acc;
      }
      acc[path] = createPathItem(pathItemObject, components);
      return acc;
    },
    {},
  );
};
