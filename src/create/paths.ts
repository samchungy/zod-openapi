import { createCallbacks } from './callbacks.js';
import type { ComponentRegistry } from './components.js';
import type {
  ZodOpenApiOperationObject,
  ZodOpenApiPathsObject,
} from './document.js';
import { createManualParameters, createParameters } from './parameters.js';
import { createResponses } from './responses.js';
import { isISpecificationExtension } from './specificationExtension.js';

import type { oas31 } from '@zod-openapi/openapi3-ts';

export const createOperation = (
  operation: ZodOpenApiOperationObject,
  registry: ComponentRegistry,
  path: string[],
): oas31.OperationObject | undefined => {
  const {
    parameters,
    requestParams,
    requestBody,
    responses,
    callbacks,
    ...rest
  } = operation;
  const operationObject: oas31.OperationObject = rest;

  const maybeManualParameters = createManualParameters(parameters, registry, [
    ...path,
    'parameters',
  ]);

  const maybeRequestParams = createParameters(requestParams, registry, [
    ...path,
    'requestParams',
  ]);

  if (maybeRequestParams || maybeManualParameters) {
    operationObject.parameters = [
      ...(maybeRequestParams ?? []),
      ...(maybeManualParameters ?? []),
    ];
  }

  const maybeRequestBody =
    requestBody && registry.addRequestBody(requestBody, path);

  if (maybeRequestBody) {
    operationObject.requestBody = maybeRequestBody;
  }

  const maybeResponses = createResponses(responses, registry, [
    ...path,
    'responses',
  ]);

  if (maybeResponses) {
    operationObject.responses = maybeResponses;
  }

  const maybeCallbacks = createCallbacks(callbacks, registry, [
    ...path,
    'callbacks',
  ]);

  if (maybeCallbacks) {
    operationObject.callbacks = maybeCallbacks;
  }

  return operationObject;
};

export const createPaths = (
  paths: ZodOpenApiPathsObject | undefined,
  registry: ComponentRegistry,
  path: string[],
): oas31.PathsObject | undefined => {
  if (!paths) {
    return undefined;
  }

  const pathsObject: oas31.PathsObject = {};

  for (const [singlePath, pathItemObject] of Object.entries(paths)) {
    if (isISpecificationExtension(singlePath)) {
      pathsObject[singlePath] = pathItemObject;
      continue;
    }

    pathsObject[singlePath] = registry.addPathItem(pathItemObject, [
      ...path,
      singlePath,
    ]) as oas31.PathsObject;
  }

  return pathsObject;
};
