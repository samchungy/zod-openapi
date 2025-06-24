import type { $ZodType } from 'zod/v4/core';

import type { oas31 } from '../openapi3-ts/dist';
import type { PathItemObject } from '../openapi3-ts/oas31';

import { createCallbacks } from './callbacks';
import type { ComponentRegistry } from './components';
import type {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
} from './document';
import { createManualParameters, createParameters } from './parameters';
import { createRequestBody } from './requestBody';
import { createResponses } from './responses';
import { isISpecificationExtension } from './specificationExtension';

const createOperation = (
  operationObject: ZodOpenApiOperationObject,
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
  } = operationObject;
  const operation: oas31.OperationObject = rest;

  const maybeManualParameters = createManualParameters(
    parameters,
    {
      registry,
      io: 'input',
    },
    [...path, 'parameters'],
  );

  const maybeRequestParams = createParameters(
    requestParams,
    {
      registry,
      io: 'input',
    },
    [...path, 'requestParams'],
  );

  if (maybeRequestParams || maybeManualParameters) {
    operation.parameters = [
      ...(maybeRequestParams ?? []),
      ...(maybeManualParameters ?? []),
    ];
  }

  const maybeRequestBody = createRequestBody(
    requestBody,
    {
      registry,
      io: 'input',
    },
    [...path, 'requestBody'],
  );

  if (maybeRequestBody) {
    operation.requestBody = maybeRequestBody;
  }

  const maybeResponses = createResponses(
    responses,
    {
      registry,
      io: 'output',
    },
    [...path, 'responses'],
  );

  if (maybeResponses) {
    operation.responses = maybeResponses;
  }

  const maybeCallbacks = createCallbacks(callbacks, registry, [
    ...path,
    'callbacks',
  ]);

  if (maybeCallbacks) {
    operation.callbacks = maybeCallbacks;
  }

  return operation;
};

export const createPathItem = (
  pathItem: ZodOpenApiPathItemObject,
  registry: ComponentRegistry,
  path: string[],
): oas31.PathItemObject => {
  const pathItemObject: oas31.PathItemObject = {};

  for (const [key, value] of Object.entries(pathItem)) {
    if (
      key === 'get' ||
      key === 'put' ||
      key === 'post' ||
      key === 'delete' ||
      key === 'options' ||
      key === 'head' ||
      key === 'patch' ||
      key === 'trace'
    ) {
      pathItemObject[key] = createOperation(
        value as ZodOpenApiOperationObject,
        registry,
        [...path, key],
      );
      continue;
    }

    if (key === 'parameters') {
      pathItemObject[key] = createManualParameters(
        value as
          | Array<$ZodType | oas31.ParameterObject | oas31.ReferenceObject>
          | undefined,
        {
          registry,
          io: 'input',
        },
        [...path, key],
      );
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    pathItemObject[key as keyof PathItemObject] = value;
  }

  return pathItemObject;
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

    pathsObject[singlePath] = createPathItem(pathItemObject, registry, [
      ...path,
      singlePath,
    ]);
  }

  return pathsObject;
};
