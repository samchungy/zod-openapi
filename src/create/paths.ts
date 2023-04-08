import { oas31 } from 'openapi3-ts';

import { isISpecificationExtension } from '../specificationExtension';

import {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
} from './document';
import { createResponses } from './responses/responses';

const createOperation = (
  operationObject?: ZodOpenApiOperationObject,
): oas31.OperationObject | undefined => {
  if (!operationObject) {
    return undefined;
  }
  return {
    ...operationObject,
    requestBody: {
      content: {},
    },
    responses: createResponses(operationObject.responses),
  };
};

export const createPathItem = (
  pathObject: ZodOpenApiPathItemObject,
): oas31.PathItemObject => ({
  ...pathObject,
  get: createOperation(pathObject.get),
  put: createOperation(pathObject.put),
  post: createOperation(pathObject.post),
  delete: createOperation(pathObject.delete),
  options: createOperation(pathObject.options),
  head: createOperation(pathObject.head),
  patch: createOperation(pathObject.patch),
  trace: createOperation(pathObject.trace),
});

export const createPaths = (
  pathsObject?: ZodOpenApiPathsObject,
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
      acc[path] = createPathItem(pathItemObject);
      return acc;
    },
    {},
  );
};
