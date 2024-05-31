import type { oas31 } from '../openapi3-ts/dist';

import { createCallbacks } from './callbacks';
import {
  type ComponentsObject,
  createComponentRequestBodyRef,
} from './components';
import { createContent } from './content';
import type {
  ZodOpenApiOperationObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiPathsObject,
  ZodOpenApiRequestBodyObject,
} from './document';
import { createParametersObject } from './parameters';
import { createResponses } from './responses';
import { isISpecificationExtension } from './specificationExtension';

export const createRequestBody = (
  requestBodyObject: ZodOpenApiRequestBodyObject | undefined,
  components: ComponentsObject,
  subpath: string[],
): oas31.ReferenceObject | oas31.RequestBodyObject | undefined => {
  if (!requestBodyObject) {
    return undefined;
  }

  const component = components.requestBodies.get(requestBodyObject);
  if (component && component.type === 'complete') {
    return {
      $ref: createComponentRequestBodyRef(component.ref),
    };
  }

  const ref = requestBodyObject.ref ?? component?.ref;

  const requestBody: oas31.RequestBodyObject = {
    ...requestBodyObject,
    content: createContent(requestBodyObject.content, components, 'input', [
      ...subpath,
      'content',
    ]),
  };

  if (ref) {
    components.requestBodies.set(requestBodyObject, {
      type: 'complete',
      ref,
      requestBodyObject: requestBody,
    });
    return {
      $ref: createComponentRequestBodyRef(ref),
    };
  }

  return requestBody;
};

const createOperation = (
  operationObject: ZodOpenApiOperationObject,
  components: ComponentsObject,
  subpath: string[],
): oas31.OperationObject | undefined => {
  const { parameters, requestParams, requestBody, responses, ...rest } =
    operationObject;

  const maybeParameters = createParametersObject(
    parameters,
    requestParams,
    components,
    [...subpath, 'parameters'],
  );

  const maybeRequestBody = createRequestBody(
    operationObject.requestBody,
    components,
    [...subpath, 'request body'],
  );

  const maybeResponses = createResponses(
    operationObject.responses,
    components,
    [...subpath, 'responses'],
  );

  const maybeCallbacks = createCallbacks(
    operationObject.callbacks,
    components,
    [...subpath, 'callbacks'],
  );

  return {
    ...rest,
    ...(maybeParameters && { parameters: maybeParameters }),
    ...(maybeRequestBody && { requestBody: maybeRequestBody }),
    ...(maybeResponses && { responses: maybeResponses }),
    ...(maybeCallbacks && { callbacks: maybeCallbacks }),
  };
};

export const createPathItem = (
  pathObject: ZodOpenApiPathItemObject,
  components: ComponentsObject,
  path: string[],
): oas31.PathItemObject =>
  Object.entries(pathObject).reduce<oas31.PathItemObject>(
    (acc, [key, value]) => {
      if (!value) {
        return acc;
      }

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
        acc[key] = createOperation(
          value as ZodOpenApiOperationObject,
          components,
          [...path, key],
        );
        return acc;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      acc[key as keyof typeof pathObject] = value;
      return acc;
    },
    {},
  );

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
      acc[path] = createPathItem(pathItemObject, components, [path]);
      return acc;
    },
    {},
  );
};
